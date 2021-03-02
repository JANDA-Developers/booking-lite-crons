import {
  DocumentType,
  getModelForClass,
  Pre,
  Prop,
  Severity,
} from "@typegoose/typegoose";
import { IsDefined, MaxLength, Min, MinLength } from "class-validator";
import { ObjectId } from "mongodb";
import { Attribute } from "../../commonTypes/Attribute.type";
import { Node } from "../../commonTypes/Node";
import {
  Action,
  Currency,
  ProductType,
  ServiceUsageType,
} from "../../../enums";
import { Product } from "../Product/Product.model";
import {
  IAutomator,
  IAutomatable,
  IAutomatorPayloadTemplate,
} from "./IAutomator.interface";
import { chargeServiceUsage } from "../../Service/ServiceUsage.type";
import {
  TimezoneEnum,
  Timezone,
  TimezoneMap,
} from "../../commonTypes/Timezone.type";
import { ClientSession } from "mongoose";
export abstract class ProductTemplate<T = any>
  implements IAutomatorPayloadTemplate<Product, T> {
  abstract generate(input?: T): Product;
  @Prop({ required: [true, "capacity is undefined!"] })
  capacity!: number;

  @Prop()
  capacityPick?: number;

  @Prop({ required: true, validate: (value) => value > 0 })
  @Min(0)
  price!: number;

  @Prop({ default: Currency.KRW })
  currency: Currency = Currency.KRW;

  @Prop({ type: () => [Attribute], default: [], _id: false })
  attrs!: Attribute[];
}

export abstract class AbsProductAutomator<T extends Product>
  extends Node
  implements IAutomator<T> {
  abstract generate(sessin?: ClientSession): Promise<IAutomatable[]>;
  abstract destroy(
    session?: ClientSession,
    date?: Date
  ): Promise<IAutomatable[]>;
  abstract templates: IAutomatorPayloadTemplate<T>[];

  get usageType(): ServiceUsageType {
    return ServiceUsageType.PRODUCT_AUTOMATOR;
  }
  @Prop({
    type: () => Timezone,
    _id: false,
    default: TimezoneMap.get(TimezoneEnum.ASIA_SEOUL),
  })
  timezone!: Timezone;

  @Prop({
    type: () => ObjectId,
    required: true,
    default(this: AbsProductAutomator<T>) {
      return this.ownerId;
    },
  })
  serviceCustomerId!: ObjectId;

  @Prop({ default: "JANDA", required: true })
  serviceProviderName!: string;

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
}

@Pre("save", async function (this: DocumentType<ProductAutomator>, next) {
  if (this.__v == null) {
    const session = this.$session();
    this.serviceCustomerId = this.ownerId;
    if (!this.serviceProviderName) {
      this.serviceProviderName = process.env.SERVICE_PROVIDER_NAME || "";
    }
    await chargeServiceUsage(this, Action.CREATE, session);
  }
  next();
})
export class ProductAutomator extends AbsProductAutomator<Product> {
  templates!: ProductTemplate[];
  async generate(): Promise<IAutomatable[]> {
    throw new Error(
      "This class is BaseProductAutomator for just DB Model. Please inherit this and use it"
    );
  }
  async destroy(): Promise<IAutomatable[]> {
    throw new Error(
      "This class is BaseProductAutomator for just DB Model. Please inherit this and use it"
    );
  }
}

export const COLLECTION_PRODUCT_AUTOMATOR = "ProductAutomator";

export const ProductAutomatorModel = getModelForClass(ProductAutomator, {
  schemaOptions: {
    timestamps: true,
    collection: COLLECTION_PRODUCT_AUTOMATOR,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
});
