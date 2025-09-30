import { Module } from '@nestjs/common';
import { SharedModule } from '@/common/shared.module';
import { MediaModule } from '@/media/media.module';
import { CategoriesService } from './categories.service';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';
import { CategoriesController } from './categories.controller';
import { PostsController } from './posts.controller';
import { CommentsController } from './comments.controller';

@Module({
  imports: [
    SharedModule, 
    MediaModule
  ],
  providers: [
    CategoriesService, 
    PostsService, 
    CommentsService
  ],
  controllers: [
    CategoriesController, 
    PostsController, 
    CommentsController
  ],
})
export class BlogModule {}
