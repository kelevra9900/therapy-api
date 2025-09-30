import {Module} from '@nestjs/common';

import {SharedModule} from '../common/shared.module';
import {AuthService} from '@/auth/auth.service';
import {DashboardService} from './dashboard.service';
import {DashboardController} from './dashboard.controller';

@Module({
  imports: [SharedModule],
  providers: [DashboardService, AuthService],
  exports: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule { }