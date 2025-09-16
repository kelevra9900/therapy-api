import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentStatusDto } from './dtos/comment.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/roles.decorator';
import { Role } from '@prisma/client';
import { User } from '@/common/decorators/user.decorator';
import { JwtPayload } from '@/auth/types';

@ApiTags('Blog - Comments')
@Controller('blog')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post('posts/:postId/comments')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create comment on a post (auth required). Starts as PENDING.' })
  @ApiParam({ name: 'postId', type: String })
  @ApiBody({ type: CreateCommentDto })
  create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @User() user: JwtPayload,
  ) {
    return this.comments.create(postId, dto, user);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'List comments for a post (public sees only APPROVED; admin sees all)' })
  @ApiParam({ name: 'postId', type: String })
  list(@Param('postId') postId: string, @User() user?: JwtPayload) {
    return this.comments.listForPost(postId, user);
  }

  @Patch('comments/:id/status')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change comment status (admin only)' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCommentStatusDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCommentStatusDto,
    @User() user: JwtPayload,
  ) {
    return this.comments.updateStatus(id, dto, user);
  }

  @Delete('comments/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete comment (admin only)' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id') id: string, @User() user: JwtPayload) {
    return this.comments.remove(id, user);
  }
}

