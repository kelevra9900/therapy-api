import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role, PostStatus } from '@prisma/client';

import { QueryOptionsDto } from '@/common/dtos/query-options.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { PostsService } from './posts.service';

import { JwtPayload } from '@/auth/types';
import { AuthGuard } from '@/auth/auth.guard';
import { CreatePostDto, UpdatePostDto, UpdatePostStatusDto } from './dtos/post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { MediaFile } from '@/media/media.types';

@ApiTags('Blog - Posts')
@Controller('blog/posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List posts (public, paginated). Defaults to published.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  findAll(
    @Query() query: QueryOptionsDto & { status?: PostStatus; categoryId?: string },
  ) {
    // Default: Get all 
    const effectiveQuery: any = { ...query };
    
    // Normalize blank query strings to undefined
    if (typeof effectiveQuery.search === 'string' && effectiveQuery.search.trim() === '') {
      effectiveQuery.search = undefined;
    }
    if (typeof effectiveQuery.categoryId === 'string' && effectiveQuery.categoryId.trim() === '') {
      effectiveQuery.categoryId = undefined;
    }

    return this.posts.findAll(effectiveQuery);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get post by slug (public)' })
  @ApiParam({ name: 'slug', type: String })
  findBySlug(@Param('slug') slug: string) {
    return this.posts.findBySlug(slug);
  }

  @HttpPost()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  @ApiOperation({ summary: 'Create post (author or admin). Status forced to DRAFT.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  @UseInterceptors(FileInterceptor('coverImageFile', { storage: memoryStorage() }))
  create(
    @Body() dto: CreatePostDto,
    @User() user: JwtPayload,
    @UploadedFile() coverImageFile?: MediaFile,
  ) {
    return this.posts.create(dto, user, coverImageFile);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  @ApiOperation({ summary: 'Update post (author or admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePostDto })
  @UseInterceptors(FileInterceptor('coverImageFile', { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @User() user: JwtPayload,
    @UploadedFile() coverImageFile?: MediaFile,
  ) {
    return this.posts.update(id, dto, user, coverImageFile);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change post status (admin only): publish/unpublish/archive' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePostStatusDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePostStatusDto, @User() user: JwtPayload) {
    return this.posts.updateStatus(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete post (admin only)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string, @User() user: JwtPayload) {
    return this.posts.remove(id, user);
  }
}
