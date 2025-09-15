import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { CreateClientDto } from './dtos/create-client.dto';
import { FormResponseSummaryDto } from './dtos/therapist-form-summary.dto';
import { FormResponseDetailDto } from './dtos/form-response-detail.dto';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {PaginatedResponse} from '@/common/types/paginated-response.type';
import {ClientDto} from './dtos/client.dto';
import { FormTemplateDetailDto } from '@/form-templates/dtos/form-template-detail.dto';
import { CreateFormInvitationDto } from '@/forms/dtos/create-form-invitation.dto';
import { FormInvitationResponseDto } from '@/forms/dtos/form-invitation-response.dto';
import { MailService } from '@/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { ClientOverviewDto } from './dtos/client-overview.dto';
import { TherapistFormResponseDto } from './dtos/therapist-form-response.dto';

@Injectable()
export class TherapistService {
    private readonly logger = new Logger(TherapistService.name);
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
    });
  }

  async attachClientWithForm(
    dto: CreateFormInvitationDto,
    therapistId: string,
  ): Promise<FormInvitationResponseDto> {
    const client = await this.prisma.client.findUnique({ where: { id: dto.clientId } });
    if (!client || client.therapistId !== therapistId) {
      throw new ForbiddenException('Client does not belong to the therapist.');
    }

    const formTemplate = await this.prisma.formTemplate.findFirst({
      where: { id: dto.formTemplateId, isActive: true },
    });
    if (!formTemplate) {
      throw new NotFoundException('Form template not found or inactive.');
    }

    const token = crypto.randomUUID();

    const invitation = await this.prisma.formInvitation.create({
      data: {
        token,
        therapistId,
        clientId: dto.clientId,
        formTemplateId: dto.formTemplateId,
        expiresAt: dto.expiresAt ?? null,
      },
      include: {
        client: true,
        formTemplate: true,
      },
    });

    // Send email notification to client if email exists
    if (invitation.client.email) {
      this.logger.debug(`Intent to send email to ${invitation.client.email}...`)
      const baseUrl = this.config.get<string>('FRONTEND_URL') ?? '';
      const invitationLink = `${baseUrl}/form-invitations/${invitation.token}`;
      this.mail
        .sendFormInvitationEmail({
          to: invitation.client.email,
          formTitle: invitation.formTemplate.title,
          invitationLink,
          clientName: invitation.client.name,
          expiresAt: invitation.expiresAt ?? undefined,
        })
        .then(() => this.logger.debug(`Email dispatch attempted to ${invitation.client.email}`))
        .catch((e) => this.logger.error('Failed to send email', e));
    }

    return {
      id: invitation.id,
      token: invitation.token,
      clientId: invitation.clientId,
      clientName: invitation.client.name,
      formTemplateId: invitation.formTemplateId,
      formTitle: invitation.formTemplate.title,
      isCompleted: invitation.isCompleted,
      createdAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt?.toISOString() ?? null,
    };
  }

async getClients(query: QueryOptionsDto, therapistId: string): Promise<PaginatedResponse<ClientDto>> {
  const { page = 1, limit = 10, search } = query;

  const baseSearchCondition = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const where: any = {
    therapistId,
    ...baseSearchCondition,
  };

  const [totalCount, clients] = await this.prisma.$transaction([
    this.prisma.client.count({ where }),
    this.prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true,
        gender: true,
        createdAt: true,
        notes: true
      },
    }),
  ]);

  return {
    data: clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email ?? '',
      birthday: client.birthDate ?? null,
      notes: client.notes ?? '',
      gender: client.gender ?? '',
      created_at: client.createdAt ?? null
    })),
    meta: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      pageSize: limit,
    },
  };
}


  async createClient(therapistId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        therapistId,
        name: dto.name,
        email: dto.email,
        birthDate: dto.birthDate,
        gender: dto.gender,
        notes: dto.notes,
      },
    });
  }

  async deletePatient(id: string){
    return {
      message: `Delete this id ${id}`
    }
  }

  async getFormResponses(query: QueryOptionsDto, therapistId: string): Promise<PaginatedResponse<FormResponseSummaryDto>> {
    const { page = 1, limit = 10, search } = query;
    const baseSearchCondition = search
      ? {
          OR: [
            { client: { name: { contains: search, mode: 'insensitive' } } },
            { client: { email: { contains: search, mode: 'insensitive' } } },
            { formTemplate: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};
    const where: any = {
      therapistId,
      ...baseSearchCondition,
    };
    // Select only required fields and include client basic info
    const [totalCount, responses] = await this.prisma.$transaction([
      this.prisma.formResponse.count({ where }),
      this.prisma.formResponse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          filledAt: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              birthDate: true,
            },
          },
          formTemplate: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { filledAt: 'desc' },
      }),
    ]);

    return {
      data: responses.map((response) => ({
        id: response.id,
        filledAt: response.filledAt.toISOString(),
        clientName: response.client.name,
        clientEmail: response.client.email || '',
        clientId: response.client.id,
        clientBirthday: response.client.birthDate ?? null,
        formTemplateTitle: response.formTemplate.title,
      })),
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    }
  }

  async getAvailableForms(
  query: QueryOptionsDto
) {
  const { page = 1, limit = 10, search } = query;
  const baseSearchCondition = search
  ? {
      OR: [
        { client: { title: { contains: search, mode: 'insensitive' } } },
        { client: { description: { contains: search, mode: 'insensitive' } } },
      ],
    }
  : {};
  const where: any = {
    isActive: true,
    ...baseSearchCondition,
  };
    const [totalCount, forms] = await this.prisma.$transaction([
      this.prisma.formTemplate.count({where}),
      this.prisma.formTemplate.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
      })
    ])
    return {
      data: forms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      })),
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    }
  }

  async getFormInformation(uid: string): Promise<FormTemplateDetailDto> {
    const form = await this.prisma.formTemplate.findUnique({
      where: { id: uid },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!form) throw new NotFoundException('Formulario no encontrado');

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      isActive: form.isActive,
      createdBy: form.createdBy,
      createdAt: form.createdAt.toISOString(),
      questions: form.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        order: q.order,
      })),
    };
  }

  async getFormResponseDetail(
    therapistId: string,
    formResponseId: string,
  ): Promise<FormResponseDetailDto> {
    const formResponse = await this.prisma.formResponse.findUnique({
      where: { id: formResponseId },
      include: {
        therapist: true,
        client: true,
        formTemplate: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!formResponse) throw new NotFoundException('Respuesta no encontrada');
    if (formResponse.therapistId !== therapistId)
      throw new ForbiddenException('No autorizado para ver esta respuesta');

    return {
      id: formResponse.id,
      filledAt: formResponse.filledAt.toISOString(),
      clientId: formResponse.client.id,
      clientName: formResponse.client.name,
      clientEmail: formResponse.client.email || '',
      formTemplateTitle: formResponse.formTemplate.title,
      responses: formResponse.answers.map((answer) => ({
        questionId: answer.question.id,
        questionText: answer.question.text,
        type: answer.question.type,
        answer: answer.answer,
      })),
    };
  }

  async getClientOverview(therapistId: string, clientId: string): Promise<ClientOverviewDto> {
    const client = await this.prisma.client.findFirst({
      where: { id: clientId, therapistId },
    });

    if (!client) throw new NotFoundException('Client not found');

    const invitations = await this.prisma.formInvitation.findMany({
      where: {
        therapistId,
        clientId,
        isCompleted: false,
      },
      include: {
        formTemplate: true,
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingInvitations: FormInvitationResponseDto[] = invitations.map((inv) => ({
      id: inv.id,
      token: inv.token,
      clientId: inv.clientId,
      clientName: inv.client.name,
      formTemplateId: inv.formTemplateId,
      formTitle: inv.formTemplate.title,
      isCompleted: inv.isCompleted,
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt?.toISOString() ?? null,
    }));

    const latestResponseEntity = await this.prisma.formResponse.findFirst({
      where: {
        therapistId,
        clientId,
      },
      include: {
        client: true,
        formTemplate: true,
        answers: { include: { question: true } },
      },
      orderBy: { filledAt: 'desc' },
    });

    let latestResponse: TherapistFormResponseDto | null = null;
    if (latestResponseEntity) {
      latestResponse = {
        id: latestResponseEntity.id,
        client: {
          id: latestResponseEntity.client.id,
          name: latestResponseEntity.client.name,
          email: latestResponseEntity.client.email ?? '',
          birthday: latestResponseEntity.client.birthDate ?? null,
          notes: latestResponseEntity.client.notes ?? '',
          gender: latestResponseEntity.client.gender ?? '',
          created_at: latestResponseEntity.client.createdAt ?? null
        },
        title: latestResponseEntity.formTemplate.title,
        filledAt: latestResponseEntity.filledAt.toISOString(),
        responses: latestResponseEntity.answers.map((a) => ({
          questionText: a.question.text,
          answer: a.answer,
          type: a.question.type,
        })),
        score: latestResponseEntity.score ?? undefined,
        level: latestResponseEntity.level ?? undefined,
      };
    }

    return {
      client: {
        id: client.id,
        name: client.name,
        email: client.email ?? '',
        birthday: client.birthDate || null,
        notes: client.notes ?? '',
        gender: client.gender ?? '',
        created_at: client.createdAt
      },
      pendingInvitations,
      latestResponse,
    };
  }
}
