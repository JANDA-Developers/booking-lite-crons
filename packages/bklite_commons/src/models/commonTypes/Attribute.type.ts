import { Prop } from "@typegoose/typegoose";
import { DisplayType } from "../../enums";
import { Tag } from "./Tag.type";

/**
 * 예약시 받을 추가 필드?
 */
export class Attribute {
  @Prop({ type: () => [Tag], _id: false })
  tags?: Tag[];

  @Prop()
  value?: string;

  @Prop()
  placeHolder?: string;

  @Prop()
  default?: string;

  @Prop()
  require?: boolean;

  @Prop()
  options?: string[];

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  key!: string;

  @Prop({ enum: DisplayType })
  displayType!: DisplayType;
}

/**
 * 예약할때 받는 파라미터?
 */
export class AttributeParam {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  value!: string;
}
