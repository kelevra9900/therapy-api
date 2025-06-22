import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { CreateClientDto } from './dtos/create-client.dto';
import { FormResponseSummaryDto } from './dtos/therapist-form-summary.dto';
import { FormResponseDetailDto } from './dtos/form-response-detail.dto';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {PaginatedResponse} from '@/common/types/paginated-response.type';
import {ClientDto} from './dtos/client.dto';

@Injectable()
export class TherapistService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
      },
    });
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
      },
    }),
  ]);

  return {
    data: clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email || '',
      birthDate: client.birthDate ? client.birthDate.toISOString() : null,
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
    const [totalCount, responses] = await this.prisma.$transaction([
      this.prisma.formResponse.count({ where }),
      this.prisma.formResponse.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: true,
          formTemplate: true,
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
}
