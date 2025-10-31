import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    const token = authHeader ? authHeader.split(' ')[1] : undefined;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      // Normalize payload to req.user with common fields used across the app
      (req as any).user = {
        id: payload.sub ?? payload.id,
        email: payload.username ?? payload.email,
        role: payload.userRole ?? payload.role,
        // keep original payload if needed
        _raw: payload,
      };
      next();
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
