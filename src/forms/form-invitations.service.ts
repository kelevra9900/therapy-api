import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {PrismaService} from '@/prisma/prisma.service';
import {CreateFormInvitationDto} from './dtos/create-form-invitation.dto';
import {JwtPayload} from '@/auth/types';
import {Role} from '@prisma/client';
import {format} from 'date-fns';
import {FormInvitationResponseDto} from './dtos/form-invitation-response.dto';
import {CreateFormResponseDto} from './dtos/reate-form-response.dto';

@Injectable()
export class FormInvitationsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateFormInvitationDto,user: JwtPayload): Promise<FormInvitationResponseDto> {
    if (user.role !== Role.THERAPIST && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only therapists can send form invitations.');
    }

    const client = await this.prisma.client.findUnique({
      where: {id: dto.clientId},
    });

    if (!client || client.therapistId !== user.sub) {
      throw new ForbiddenException('Client does not belong to the therapist.');
    }

    const formTemplate = await this.prisma.formTemplate.findFirst({
      where: {
        id: dto.formTemplateId,
        isActive: true,
      },
    });

    if (!formTemplate) {
      throw new NotFoundException('Form template not found or inactive.');
    }

    const token = crypto.randomUUID();

    const invitation = await this.prisma.formInvitation.create({
      data: {
        token,
        therapistId: user.sub,
        clientId: dto.clientId,
        formTemplateId: dto.formTemplateId,
        expiresAt: dto.expiresAt ?? null,
      },
      include: {
        client: true,
        formTemplate: true,
      },
    });

    return {
      id: invitation.id,
      token: invitation.token,
      clientId: invitation.clientId,
      clientName: invitation.client.name,
      formTemplateId: invitation.formTemplateId,
      formTitle: invitation.formTemplate.title,
      isCompleted: invitation.isCompleted,
      createdAt: format(invitation.createdAt,'yyyy-MM-dd HH:mm:ss'),
      expiresAt: invitation.expiresAt?.toISOString() ?? null,
    };
  }

  async findByToken(token: string) {
    const invitation = await this.prisma.formInvitation.findUnique({
      where: {token},
      include: {
        formTemplate: {
          include: {
            questions: {
              orderBy: {order: 'asc'},
            },
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    return {
      id: invitation.id,
      isCompleted: invitation.isCompleted,
      token: invitation.token,
      formTemplate: {
        id: invitation.formTemplate.id,
        title: invitation.formTemplate.title,
        description: invitation.formTemplate.description,
        questions: invitation.formTemplate.questions.map((q) => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options,
          order: q.order,
        })),
      },
    };
  }

  async markAsCompleted(token: string) {
    const invitation = await this.prisma.formInvitation.findUnique({
      where: {token},
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return this.prisma.formInvitation.update({
      where: {token},
      data: {isCompleted: true},
    });
  }

  async findAllForTherapist(user: JwtPayload): Promise<FormInvitationResponseDto[]> {
    if (user.role !== Role.THERAPIST && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const invitations = await this.prisma.formInvitation.findMany({
      where: {therapistId: user.sub},
      orderBy: {createdAt: 'desc'},
      include: {
        client: true,
        formTemplate: true,
      },
    });

    return invitations.map((i) => ({
      id: i.id,
      token: i.token,
      clientId: i.clientId,
      clientName: i.client.name,
      formTemplateId: i.formTemplateId,
      formTitle: i.formTemplate.title,
      isCompleted: i.isCompleted,
      createdAt: format(i.createdAt,'yyyy-MM-dd HH:mm:ss'),
      expiresAt: i.expiresAt?.toISOString() ?? null,
    }));
  }

  async submitResponses(token: string,dto: CreateFormResponseDto) {
    const invitation = await this.prisma.formInvitation.findUnique({
      where: {token},
      include: {
        formTemplate: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.isCompleted) throw new BadRequestException('Form already completed');
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date())
      throw new BadRequestException('Invitation expired');

    const validQuestionIds = invitation.formTemplate.questions.map((q) => q.id);
    const invalidAnswers = Object.keys(dto.answers).some(
      (qid) => !validQuestionIds.includes(qid)
    );

    if (invalidAnswers) {
      throw new BadRequestException('Some question IDs are invalid');
    }

    const entries = Object.entries(dto.answers);

    const invalidEntries = entries.filter(
      ([,answer]) => typeof answer !== 'string' || answer.trim() === '',
    );

    if (invalidEntries.length > 0) {
      throw new BadRequestException('Todas las preguntas deben tener respuesta válida.');
    }


    const response = await this.prisma.formResponse.create({
      data: {
        formTemplateId: invitation.formTemplateId,
        therapistId: invitation.therapistId,
        clientId: invitation.clientId,
        answers: {
          createMany: {
            data: entries.map(([questionId,answer]) => ({
              questionId,
              answer: String(answer),
            })),
          },
        },

      },
    });

    await this.prisma.formInvitation.update({
      where: {token},
      data: {isCompleted: true},
    });

    return {message: 'Formulario respondido exitosamente',responseId: response.id};
  }

  async getResponses(token: string,user: JwtPayload) {
    const invitation = await this.prisma.formInvitation.findUnique({
      where: {token},
      include: {
        client: true,
        formTemplate: {
          include: {questions: true},
        },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.therapistId !== user.sub && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    // Buscar el FormResponse correspondiente
    const formResponse = await this.prisma.formResponse.findFirst({
      where: {
        formTemplateId: invitation.formTemplateId,
        clientId: invitation.clientId,
        therapistId: invitation.therapistId,
      },
      include: {
        answers: {
          include: {question: true},
        },
      },
    });

    if (!formResponse) {
      throw new NotFoundException('No response found for this form invitation.');
    }

    return {
      id: formResponse.id,
      filledAt: formResponse.filledAt,
      client: {
        id: invitation.client.id,
        name: invitation.client.name,
        email: invitation.client.email,
      },
      formTemplate: {
        id: invitation.formTemplate.id,
        title: invitation.formTemplate.title,
        description: invitation.formTemplate.description,
      },
      responses: formResponse.answers.map((a) => ({
        questionId: a.question.id,
        questionText: a.question.text,
        type: a.question.type,
        answer: a.answer,
      })),
      score: formResponse.score,
      level: formResponse.level,
    };
  }
}
