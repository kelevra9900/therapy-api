import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	Query,
	UseGuards,
	HttpCode,
} from '@nestjs/common';
import {
	ApiBearerAuth,
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiQuery,
	ApiBody,
} from '@nestjs/swagger';

import {AuthGuard} from '@/auth/auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/roles.decorator';
import {Role} from '@prisma/client';
import {JwtPayload} from '@/auth/types';
import {User} from '@/common/decorators/user.decorator';

import {FormTemplatesService} from './form-templates.service';
import {CreateFormTemplateDto} from './dtos/create-form-template.dto';
import {UpdateFormTemplateDto} from './dtos/update-form-template.dto';
import {PaginatedResponse} from '@/common/types/paginated-response.type';
import {FormTemplateResponseDto} from './dtos/form-template-response.dto';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';

@ApiTags('Admin - Form Templates')
@ApiBearerAuth()
@Controller('admin/form-templates')
@UseGuards(AuthGuard,RolesGuard)
@Roles(Role.ADMIN)
export class FormTemplatesController {
	constructor(private readonly formTemplatesService: FormTemplatesService) { }

	@Post()
	@ApiOperation({summary: 'Create new form template'})
	@ApiBody({type: CreateFormTemplateDto})
	@ApiResponse({status: 201,type: FormTemplateResponseDto})
	create(@Body() dto: CreateFormTemplateDto,@User() user: JwtPayload) {
		return this.formTemplatesService.create(dto,user);
	}

	@Get()
	@ApiOperation({summary: 'Get all form templates (paginated)'})
	@ApiQuery({name: 'page',required: false,type: Number})
	@ApiQuery({name: 'limit',required: false,type: Number})
	@ApiQuery({name: 'search',required: false,type: String})
	@ApiResponse({status: 200,type: FormTemplateResponseDto,isArray: true})
	getAll(@Query() query: QueryOptionsDto): Promise<PaginatedResponse<FormTemplateResponseDto>> {
		return this.formTemplatesService.getAll(query);
	}

	@Get(':id')
	@ApiOperation({summary: 'Get form template by ID'})
	@ApiParam({name: 'id',type: String})
	@ApiResponse({status: 200,type: FormTemplateResponseDto})
	getById(@Param('id') id: string) {
		return this.formTemplatesService.getById(id);
	}

	//   @Put(':id')
	//   @ApiOperation({ summary: 'Update form template by ID' })
	//   @ApiParam({ name: 'id', type: String })
	//   @ApiBody({ type: UpdateFormTemplateDto })
	//   @ApiResponse({ status: 200, type: FormTemplateResponseDto })
	//   update(@Param('id') id: string, @Body() dto: UpdateFormTemplateDto) {
	//     return this.formTemplatesService.update(id, dto);
	//   }

	@Delete(':id')
	@HttpCode(200)
	@ApiOperation({summary: 'Delete form template by ID'})
	@ApiParam({name: 'id',type: String})
	@ApiResponse({status: 200,schema: {example: {message: 'Deleted successfully'}}})
	delete(@Param('id') id: string) {
		return this.formTemplatesService.delete(id);
	}
}
