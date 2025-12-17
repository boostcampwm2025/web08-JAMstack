import { Controller } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('api/room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
}
