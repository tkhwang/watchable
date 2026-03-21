import { Injectable } from '@nestjs/common';
import { APP_NAME } from '@life-logs/domain';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello from ${APP_NAME}!`;
  }
}
