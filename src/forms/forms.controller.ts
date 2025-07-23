import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import {FormInvitationsService} from './form-invitations.service';
import {CreateFormInvitationDto} from './dtos/create-form-invitation.dto';
import {JwtPayload} from '@/auth/types';
import {AuthGuard} from '@/auth/auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/roles.decorator';
import {Role} from '@prisma/client';
import {User} from '@/common/decorators/user.decorator';
import {FormInvitationResponseDto} from './dtos/form-invitation-response.dto';
import {FormInvitationPublicDto} from './dtos/form-invitation-public.dto';
import {CreateFormResponseDto} from './dtos/reate-form-response.dto';
import {FormInvitationWithResponsesDto} from './dtos/form-invitation-with-responses.dto';

@ApiTags('Form Invitations')
@Controller('form-invitations')
export class FormInvitationsController {
  constructor(private readonly service: FormInvitationsService) { }

  @Post()
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.ADMIN,Role.THERAPIST)
  @ApiBearerAuth()
  @ApiOperation({summary: 'Create form invitation for a client'})
  @ApiBody({type: CreateFormInvitationDto})
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: FormInvitationResponseDto,
  })
  create(
    @Body() dto: CreateFormInvitationDto,
    @User() user: JwtPayload,
  ) {
    return this.service.create(dto,user);
  }

  @Get()
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.THERAPIST,Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({summary: 'List all invitations for therapist'})
  @ApiResponse({
    status: 200,
    description: 'List of form invitations',
    type: [FormInvitationResponseDto],
  })
  findAll(@User() user: JwtPayload) {
    return this.service.findAllForTherapist(user);
  }

  @Get(':token')
  @ApiOperation({summary: 'Get form invitation by token (public)'})
  @ApiParam({name: 'token',type: String})
  @ApiResponse({
    status: 200,
    description: 'Form invitation details with questions',
    type: FormInvitationPublicDto,
  })
  findByToken(@Param('token') token: string) {
    return this.service.findByToken(token);
  }

  @Patch(':token/complete')
  @HttpCode(204)
  @ApiOperation({summary: 'Mark form invitation as completed (public)'})
  @ApiParam({name: 'token',type: String})
  @ApiResponse({status: 204,description: 'Invitation marked as completed'})
  markAsCompleted(@Param('token') token: string) {
    return this.service.markAsCompleted(token);
  }

  @Post(':token/responses')
  @HttpCode(201)
  @ApiOperation({summary: 'Enviar respuestas a un formulario (público)'})
  @ApiParam({name: 'token',type: String})
  @ApiBody({type: CreateFormResponseDto})
  @ApiResponse({status: 201,description: 'Formulario respondido exitosamente'})
  submitResponse(
    @Param('token') token: string,
    @Body() dto: CreateFormResponseDto
  ) {
    return this.service.submitResponses(token,dto);
  }

  @Get(':token/responses')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.THERAPIST, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get completed responses for a form invitation' })
  @ApiParam({ name: 'token', type: String })
  @ApiResponse({
    status: 200,
    description: 'Form invitation with responses',
    type: FormInvitationWithResponsesDto,
  })
  getResponses(@Param('token') token: string, @User() user: JwtPayload) {
    return this.service.getResponses(token, user);
  }

}
