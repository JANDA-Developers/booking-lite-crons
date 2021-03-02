import {
  DocumentType,
  getModelForClass,
  Post,
  Pre,
  Prop,
  Severity,
} from "@typegoose/typegoose";
import cryptoRandomString from "crypto-random-string";
import { ObjectId } from "mongodb";
import { Attribute } from "../../commonTypes/Attribute.type";
import { Node } from "../../commonTypes/Node";
import { ServiceChargeTarget } from "../../Service/ServiceTarget.model";
import {
  Action,
  Currency,
  ProductType,
  ServiceUsageType,
} from "../../../enums";
import { chargeServiceUsage } from "../../Service/ServiceUsage.type";
import { Tag } from "../../commonTypes/Tag.type";
import { IAutomatable } from "../ProductAutomator/IAutomator.interface";

export interface Product extends Node, ServiceChargeTarget {
  serviceCustomerId: ObjectId;
  serviceProviderName: string;
  type: ProductType;
  attrs: Attribute[];
  code: string;
  _itemId: ObjectId;
  _ownerId: ObjectId;
  tags: Tag[];
}

export const serviceUsageChargingForProduct = async (
  product: DocumentType<Product>
) => {
  product.serviceCustomerId = product._ownerId;
  if (!product.serviceProviderName) {
    product.serviceProviderName = process.env.SERVICE_PROVIDER_NAME || "";
  }
  return await chargeServiceUsage(product, Action.CREATE, product.$session());
};

@Pre("save", async function (this: DocumentType<Product>, next: any) {
  if (this.__v == null) {
    serviceUsageChargingForProduct(this);
  }
  next();
})
@Post<Product>(
  "insertMany",
  async function (result: DocumentType<Product>[], next: any) {
    await Promise.all(
      result.map(async (r) => {
        return serviceUsageChargingForProduct(r);
      })
    );
    next();
  }
)
export class Product extends Node implements ServiceChargeTarget, IAutomatable {
  static generateCode() {
    return `PD-${cryptoRandomString({ length: 6, type: "alphanumeric" })}`;
  }
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
    default(this: Product) {
      return Product.generateCode();
    },
    unique: true,
    required: true,
  })
  code!: string;

  @Prop({ enum: Currency, default: Currency.KRW })
  currency: Currency = Currency.KRW;

  @Prop({ type: () => ObjectId, required: true })
  _itemId!: ObjectId;

  @Prop({ type: () => ObjectId, required: true })
  _ownerId!: ObjectId;

  @Prop({ default: [], type: () => [Tag] })
  tags!: Tag[];
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
