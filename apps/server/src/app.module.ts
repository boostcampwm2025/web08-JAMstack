import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [AuthModule, RoomModule, CollaborationModule, FileModule],
})
export class AppModule {}
