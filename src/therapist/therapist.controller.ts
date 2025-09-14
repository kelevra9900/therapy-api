import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Post,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TherapistService } from './therapist.service';
import { Role } from '@prisma/client';
import { Request } from 'express';

import {JwtAuthGuard} from '@/auth/jwt-auth.guard';
import {Roles} from '@/common/roles.decorator';
import {RolesGuard} from '@/common/guards/roles.guard';
import {UpdateProfileDto} from './dtos/update-profile.dto';
import {CreateClientDto} from './dtos/create-client.dto';
import {FormResponseSummaryDto} from './dtos/therapist-form-summary.dto';
import {FormResponseDetailDto} from './dtos/form-response-detail.dto';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {PaginatedResponse} from '@/common/types/paginated-response.type';
import {ClientDto} from './dtos/client.dto';
import { FormTemplateDetailDto } from '@/form-templates/dtos/form-template-detail.dto';
import { CreateFormInvitationDto } from '@/forms/dtos/create-form-invitation.dto';
import { FormInvitationResponseDto } from '@/forms/dtos/form-invitation-response.dto';
import { ClientOverviewDto } from './dtos/client-overview.dto';

@ApiTags('Therapist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.THERAPIST)
@Controller('therapist')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @ApiOperation({ summary: 'Actualizar perfil del terapeuta' })
  @Put('profile')
  updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ) {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const userId = req.user['sub'];
    return this.therapistService.updateProfile(userId, dto);
  }

  @Get('clients')
  @ApiOperation({ summary: 'Obtener clientes del terapeuta (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getClients(
    @Query() query: QueryOptionsDto,
    @Req() req: Request
  ): Promise<PaginatedResponse<ClientDto>> {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const userId = req.user['sub'];
    return this.therapistService.getClients(query, userId);
  }

  @ApiOperation({ summary: 'Crear cliente para el terapeuta' })
  @Post('clients')
  createClient(@Req() req: Request, @Body() dto: CreateClientDto) {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const userId = req.user['sub'];
    return this.therapistService.createClient(userId, dto);
  }

  @ApiOperation({ summary: 'Obtener formularios respondidos' })
  @Get('responses')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getFormResponses(
    @Req() req: Request,
    @Query() query: QueryOptionsDto,
  ): Promise<PaginatedResponse<FormResponseSummaryDto>> {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }

    const userId = req.user['sub'];
    return this.therapistService.getFormResponses(query, userId);
  }

  @ApiOperation({ summary: 'Obtener formularios disponibles' })
  @Get('available-forms')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getAvailableForms(
    @Query() query: QueryOptionsDto,
  ) {
    return this.therapistService.getAvailableForms(query)
  }

  @ApiOperation({ summary: 'Detalle de respuestas de un formulario' })
  @Get('responses/:id')
  getFormResponseDetail(
    @Req() req: Request,
    @Param('id') formResponseId: string,
  ): Promise<FormResponseDetailDto> {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const userId = req.user['sub'];
    return this.therapistService.getFormResponseDetail(userId, formResponseId);
  }

  @ApiOperation({ summary: 'Get form template information (by ID)' })
  @Get('forms/:id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, type: FormTemplateDetailDto })
  getFormInformation(@Param('id') id: string): Promise<FormTemplateDetailDto> {
    return this.therapistService.getFormInformation(id);
  }

  @ApiOperation({ summary: 'Attach client with form template' })
  @Post('attach-form')
  attachClientWithForm(
    @Req() req: Request,
    @Body() dto: CreateFormInvitationDto,
  ): Promise<FormInvitationResponseDto> {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const userId = req.user['sub'];
    return this.therapistService.attachClientWithForm(dto, userId);
  }


  // Patients
  @ApiOperation({ summary: 'Get client overview (pending invitations and latest response)' })
  @Get('patients/:clientId')
  getClientOverview(
    @Req() req: Request,
    @Param('clientId') clientId: string,
  ): Promise<ClientOverviewDto> {
    if (!req.user || typeof req.user['sub'] === 'undefined') {
      throw new Error('User information is missing from request');
    }
    const therapistId = req.user['sub'];
    return this.therapistService.getClientOverview(therapistId, clientId);
  }
}
