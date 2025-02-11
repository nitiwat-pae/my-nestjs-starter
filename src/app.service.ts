import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  greetingClient(): string {
    return 'Hello Client!';
  }
}
