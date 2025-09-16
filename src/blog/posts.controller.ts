import { Body, Controller, Delete, Get, Param, Patch, Post as HttpPost, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, UpdatePostStatusDto } from './dtos/post.dto';
import { QueryOptionsDto } from '@/common/dtos/query-options.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/roles.decorator';
import { Role, PostStatus } from '@prisma/client';
import { User } from '@/common/decorators/user.decorator';
import { JwtPayload } from '@/auth/types';

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
    // Default: only published if status not provided or blank
    const effectiveQuery: any = { ...query };
    const statusBlank =
      effectiveQuery.status === undefined ||
      (typeof effectiveQuery.status === 'string' && effectiveQuery.status.trim() === '');
    if (statusBlank) effectiveQuery.status = PostStatus.PUBLISHED;

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
  @ApiBody({ type: CreatePostDto })
  create(@Body() dto: CreatePostDto, @User() user: JwtPayload) {
    return this.posts.create(dto, user);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  @ApiOperation({ summary: 'Update post (author or admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePostDto })
  update(@Param('id') id: string, @Body() dto: UpdatePostDto, @User() user: JwtPayload) {
    return this.posts.update(id, dto, user);
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
