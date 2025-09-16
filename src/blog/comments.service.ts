import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCommentDto, UpdateCommentStatusDto } from './dtos/comment.dto';
import { JwtPayload } from '@/auth/types';
import { CommentStatus, Role } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(postId: string, dto: CreateCommentDto, user: JwtPayload) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.postId !== postId) throw new NotFoundException('Parent comment not found in this post');
    }
    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        parentId: dto.parentId,
        authorId: user?.sub,
        status: CommentStatus.PENDING,
      },
    });
  }

  async listForPost(postId: string, user?: JwtPayload) {
    const where = {
      postId,
      status: user && user.role === Role.ADMIN ? undefined : CommentStatus.APPROVED,
    } as any;
    return this.prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { id: true, name: true } } },
    });
  }

  async updateStatus(id: string, dto: UpdateCommentStatusDto, user: JwtPayload) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only admin can change comment status');
    await this.ensureExists(id);
    return this.prisma.comment.update({ where: { id }, data: { status: dto.status } });
  }

  async remove(id: string, user: JwtPayload) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only admin can delete comments');
    await this.ensureExists(id);
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted' };
  }

  private async ensureExists(id: string) {
    const c = await this.prisma.comment.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Comment not found');
    return c;
  }
}

