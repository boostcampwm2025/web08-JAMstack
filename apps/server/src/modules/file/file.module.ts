import { Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({
  providers: [FileService],
  exports: [FileService], // 다른 모듈에서 사용 가능하도록 export
})
export class FileModule {}
