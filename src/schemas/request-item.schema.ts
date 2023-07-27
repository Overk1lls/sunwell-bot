import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'item-requests' })
export class RequestItem {
  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  classSpec: string;

  @Prop({ required: true })
  item: string;
}

export const RequestItemSchema = SchemaFactory.createForClass(RequestItem);
