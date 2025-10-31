import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req: Request & { user?: any } = context.switchToHttp().getRequest();

    // If middleware already set req.user, accept
    if (req.user) return true;

    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (!authHeader) throw new UnauthorizedException('No token provided');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      // normalize
      req.user = {
        id: payload.sub ?? payload.id,
        email: payload.username ?? payload.email,
        role: payload.userRole ?? payload.role,
        _raw: payload,
      };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
