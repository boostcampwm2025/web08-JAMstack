import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { RoomModule } from '../room/room.module';
import { FileModule } from '../file/file.module';
import { RedisModule } from '../../config/redis.module';

@Module({
  imports: [RoomModule, RedisModule, FileModule],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}
