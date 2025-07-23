// src/modules/form-responses/form-responses.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/roles.decorator';
import { JwtPayload } from '@/auth/types';
import { User } from '@/common/decorators/user.decorator';
import { FormResponsesService } from './form-responses.service';
import { CreateFormResponseDto } from './dtos/create-form-response.dto';
import {Role} from 'generated/prisma';

@Controller('form-responses')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.THERAPIST)
export class FormResponsesController {
  constructor(private readonly formResponsesService: FormResponsesService) {}

  @Post()
  async create(
    @User() user: JwtPayload,
    @Body() dto: CreateFormResponseDto,
  ) {
    return this.formResponsesService.createFormResponse(dto, user.sub);
  }
}
