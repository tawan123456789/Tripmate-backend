import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello() {
    return { ok: true, service: 'Tripmate API', uptimeSec: Math.floor(process.uptime()) };
  }

  async health() {
    const db = await this.safeDbPing();
    return {
      ok: db.ok,
      checks: {
        db: db.ok ? 'up' : 'down',
      },
      timestamp: new Date().toISOString(),
    };
  }

  async dbHealth() {
    const db = await this.safeDbPing();
    if (!db.ok) {
      return { ok: false, error: db.error };
    }
    return { ok: true, version: db.version };
  }

  private async safeDbPing(): Promise<{ ok: boolean; version?: string; error?: string }> {
    try {
      // ping แบบเบาๆ
      await this.prisma.$queryRaw`SELECT 1`;
      // ดึงเวอร์ชัน Postgres (optional)
      const rows = await this.prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
      return { ok: true, version: rows?.[0]?.version };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? String(e) };
    }
  }
}
