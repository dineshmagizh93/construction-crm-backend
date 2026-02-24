import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { ProjectsModule } from './projects/projects.module';
import { LeadsModule } from './leads/leads.module';
import { PaymentsModule } from './payments/payments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SiteProgressModule } from './site-progress/site-progress.module';
import { VendorsModule } from './vendors/vendors.module';
import { LabourModule } from './labour/labour.module';
import { DocumentsModule } from './documents/documents.module';
import { InventoryModule } from './inventory/inventory.module';
import { UploadModule } from './upload/upload.module';
import { ReportsModule } from './reports/reports.module';
import { LoggerModule } from './logger/logger.module';
import { EmailModule } from './email/email.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    EmailModule,
    PrismaModule,
    AuthModule,
    CompanyModule,
    UserModule,
    ProjectsModule,
    LeadsModule,
    PaymentsModule,
    ExpensesModule,
    SiteProgressModule,
    VendorsModule,
    LabourModule,
    DocumentsModule,
    InventoryModule,
    UploadModule,
    ReportsModule,
    TasksModule,
  ],
})
export class AppModule {}

