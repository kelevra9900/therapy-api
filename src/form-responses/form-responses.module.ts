import { Module } from '@nestjs/common';
import {FormResponsesService} from './form-responses.service';

@Module({
  providers: [FormResponsesService],
})
export class FormResponsesModule {}
