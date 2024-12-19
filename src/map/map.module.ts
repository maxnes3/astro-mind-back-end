import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MapController],
  providers: [MapService, PrismaService],
})
export class MapModule {}
