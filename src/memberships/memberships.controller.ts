import { Controller, Get } from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

import { MembershipsService } from './memberships.service';

@Controller('memberships')
@ApiTags('Memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get()
  findAll() {
    return this.membershipsService.findAll();
  }
}
