import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService], // 다른 모듈에서 사용 가능하도록 export
})
export class RoomModule {}
