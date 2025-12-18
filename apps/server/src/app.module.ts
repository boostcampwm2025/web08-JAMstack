import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/room/room.module';
import { CollaborationModule } from './modules/collaboration/collaboration.module';
import { FileModule } from './modules/file/file.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './config/redis.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    RedisModule,
    AuthModule,
    RoomModule,
    CollaborationModule,
    FileModule,
  ],
})
export class AppModule {}
