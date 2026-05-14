import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class UserService {
  constructor(@Inject(REQUEST) private readonly request: Request) { }

  getIp(): string | undefined {
    return this.request.ip;
  }
}
