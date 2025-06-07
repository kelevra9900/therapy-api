// src/modules/form-responses/form-responses.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateFormResponseDto } from './dtos/create-form-response.dto';

@Injectable()
export class FormResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFormResponse(dto: CreateFormResponseDto, therapistId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (client.therapistId !== therapistId) {
      throw new ForbiddenException('You can only send forms to your own clients');
    }

    const template = await this.prisma.formTemplate.findUnique({
      where: { id: dto.formTemplateId },
    });

    if (!template || !template.isActive) {
      throw new NotFoundException('Form template not found or inactive');
    }

    const response = await this.prisma.formResponse.create({
      data: {
        clientId: dto.clientId,
        therapistId,
        formTemplateId: dto.formTemplateId,
      },
      select: {
        id: true,
        filledAt: true,
        clientId: true,
        formTemplateId: true,
      },
    });

    return response;
  }
}
