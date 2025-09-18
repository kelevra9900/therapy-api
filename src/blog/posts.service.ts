import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, UpdatePostStatusDto } from './dtos/post.dto';
import { QueryOptionsDto } from '@/common/dtos/query-options.dto';
import { JwtPayload } from '@/auth/types';
import { PostStatus, Role } from '@prisma/client';
import { MediaService } from '@/media/media.service';
import type { MediaFile } from '@/media/media.types';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async create(dto: CreatePostDto, user: JwtPayload, coverImageFile?: MediaFile) {
    const coverImagePath = coverImageFile
      ? await this.media.persistFile(coverImageFile, 'blog')
      : dto.coverImage;

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: coverImagePath,
        coverImageAlt: dto.coverImageAlt,
        isFeatured: dto.isFeatured ?? false,
        authorId: user.sub,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async findAll(query: QueryOptionsDto & { status?: PostStatus; categoryId?: string }) {

    const page = Number((query as any).page) || 1;
    const limit = Number((query as any).limit) || 10;
    const where: any = {};

    const search = typeof query.search === 'string' ? query.search.trim() : undefined;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }
    const categoryId = typeof query.categoryId === 'string' ? query.categoryId.trim() : undefined;
    if (categoryId) where.categoryId = categoryId;

    const [totalCount, data] = await this.prisma.$transaction([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, author: { select: { id: true, name: true } } },
      }),
    ]);

    return {
      data,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true, author: { select: { id: true, name: true } } },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  private async ensureCanEdit(id: string, user: JwtPayload) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (user.role !== Role.ADMIN && post.authorId !== user.sub) {
      throw new ForbiddenException('Not allowed to modify this post');
    }
    return post;
  }

  async update(
    id: string,
    dto: UpdatePostDto,
    user: JwtPayload,
    coverImageFile?: MediaFile,
  ) {
    const post = await this.ensureCanEdit(id, user);
    const data: any = { ...dto };
    delete data.coverImageFile;

    if (coverImageFile) {
      const newPath = await this.media.persistFile(coverImageFile, 'blog');
      if (post.coverImage) await this.media.removeFile(post.coverImage);
      data.coverImage = newPath;
    } else if (data.coverImage && data.coverImage !== post.coverImage) {
      if (post.coverImage) await this.media.removeFile(post.coverImage);
    }

    return this.prisma.blogPost.update({
      where: { id },
      data,
      include: { category: true, author: { select: { id: true, name: true } } },
    });
  }

  async updateStatus(id: string, dto: UpdatePostStatusDto, user: JwtPayload) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only admin can change status');
    const data: any = { status: dto.status };
    if (dto.status === PostStatus.PUBLISHED) data.publishedAt = new Date();
    if (dto.status === PostStatus.DRAFT) data.publishedAt = null;
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string, user: JwtPayload) {
    if (user.role !== Role.ADMIN) throw new ForbiddenException('Only admin can delete posts');
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Post deleted' };
  }
}
