import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @UseGuards(JwtAuthGuard)
  async testEmail(@Body() body: { email: string }) {
    try {
      const result = await this.emailService.sendNotificationEmail(
        body.email,
        'Test Email - Construction CRM',
        'This is a test email to verify your SMTP configuration is working correctly.'
      );
      return {
        success: true,
        message: 'Test email sent successfully',
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send test email',
        error: error.toString(),
      };
    }
  }
}


