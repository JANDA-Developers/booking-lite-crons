import { getModelForClass, Prop } from "@typegoose/typegoose";
import {
  ArrayMinSize,
  IsDefined,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ObjectId } from "mongodb";
import { AttributeParam } from "../../commonTypes/Attribute.type";
import { Node } from "../../commonTypes/Node";
import { ServiceChargeTarget } from "../../Service/ServiceTarget.model";
import { ProductType, ServiceUsageType } from "../../../enums";

export abstract class ProductParam {
  @Prop({ required: [true, "capacity is undefined!"] })
  capacity!: number;

  @Prop({ required: true, validate: (value) => value > 0 })
  @Min(0)
  price!: number;

  @Prop({ type: () => [AttributeParam], default: [] })
  attrs!: AttributeParam[];
}

export interface ProductAutomator extends Node, ServiceChargeTarget {
  isDisabled?: boolean; // 켜고 끈다..
  name: string;
  description?: string;
  type: ProductType;
  targetItemId: ObjectId;
  ownerId: ObjectId;
  productParams: ProductParam[];
}

export class ProductAutomator extends Node implements ServiceChargeTarget {
  get usageType(): ServiceUsageType {
    return ServiceUsageType.PRODUCT_AUTOMATOR;
  }

  @Prop()
  isDisabled?: boolean;

  @Prop({ required: true })
  @MinLength(3)
  @MaxLength(50)
  @IsDefined()
  name!: string;

  @Prop()
  description?: string;

  @Prop({ enum: ProductType, required: true })
  type!: ProductType;

  @Prop({ type: () => ObjectId, required: true })
  @IsDefined()
  targetItemId!: ObjectId;

  @Prop({ type: () => ObjectId, required: true })
  @IsDefined()
  ownerId!: ObjectId;

  @Prop({ type: () => [ProductParam], _id: false, default: [] })
  @ArrayMinSize(1)
  productParams!: ProductParam[];
}

export const COLLECTION_PRODUCT_AUTOMATOR = "ProductAutomator";

export const ProductAutomatorModel = getModelForClass(ProductAutomator, {
  schemaOptions: {
    timestamps: true,
    collection: COLLECTION_PRODUCT_AUTOMATOR,
  },
});
