import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [RoomModule], // RoomService 사용을 위해 import
  providers: [CollaborationGateway],
})
export class CollaborationModule {}
