import {
  DocumentType,
  getModelForClass,
  Pre,
  Prop,
  Severity,
} from "@typegoose/typegoose";
import cryptoRandomString from "crypto-random-string";
import { ObjectId } from "mongodb";
import { Attribute } from "../../commonTypes/Attribute.type";
import { Node } from "../../commonTypes/Node";
import { ServiceChargeTarget } from "../../Service/ServiceTarget.model";
import { Action, ProductType, ServiceUsageType } from "../../../enums";
import { chargeServiceUsage } from "../../Service/ServiceUsage.type";

export interface Product extends Node, ServiceChargeTarget {
  serviceCustomerId: ObjectId;
  serviceProviderName: string;
  type: ProductType;
  attrs: Attribute[];
  code: string;
  _itemId: ObjectId;
  _ownerId: ObjectId;
}

@Pre("save", async function (this: DocumentType<Product>, next: any) {
  if (this.__v == null) {
    const session = this.$session();
    this.serviceCustomerId = this._ownerId;
    if (!this.serviceProviderName) {
      this.serviceProviderName = process.env.SERVICE_PROVIDER_NAME || "";
    }
    await chargeServiceUsage(this, Action.CREATE, session);
  }
  next();
})
export class Product extends Node implements ServiceChargeTarget {
  get usageType(): ServiceUsageType {
    return ServiceUsageType.PRODUCT;
  }

  @Prop({
    default(this: DocumentType<Product>) {
      return this._ownerId;
    },
  })
  serviceCustomerId!: ObjectId;

  @Prop({ default: process.env.SERVICE_PROVIDER_NAME || "JANDA" })
  serviceProviderName!: string;

  @Prop({ enum: ProductType, type: String })
  type: ProductType = this["typeSet"];

  @Prop({ type: () => [Attribute], defualt: [] })
  attrs!: Attribute[];

  @Prop({
    default: () =>
      "PD-" +
      cryptoRandomString({
        length: 6,
      }),
    unique: true,
    required: true,
  })
  code!: string;

  @Prop({ type: () => ObjectId })
  _itemId!: ObjectId;

  @Prop({ type: () => ObjectId })
  _ownerId!: ObjectId;
}

export const COLLECTION_PRODUCT = "Product";

export const ProductModel = getModelForClass(Product, {
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    timestamps: true,
    collection: COLLECTION_PRODUCT,
  },
});
