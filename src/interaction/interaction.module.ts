import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionService } from './interaction.service';
import { RequestItem, RequestItemSchema } from '../schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: RequestItem.name, schema: RequestItemSchema }])],
  providers: [InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}
