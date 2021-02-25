import {
  DocumentType,
  getModelForClass,
  Prop,
  Severity,
} from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Action, ServiceUsageType } from "../../enums";
import { formatDate, ONE_HOUR } from "../../utils/dateUtils";
import { Node } from "../commonTypes/Node";

export interface ServiceChargeTarget {
  _id: ObjectId;
  serviceCustomerId: ObjectId;
  serviceProviderName: string; // adminUser.name
  usageType: ServiceUsageType;
}

export const getInvoiceHashId = (
  yyyymm: number,
  userId: ObjectId,
  serviceProviderName: string
) => `${yyyymm}-${serviceProviderName}-${userId}`;

export class ServiceUsage extends Node {
  @Prop({ enum: ServiceUsageType })
  type!: ServiceUsageType;

  @Prop()
  description?: string;

  @Prop({ enum: Action })
  action!: Action;

  @Prop()
  price!: number;

  @Prop()
  serviceProviderName!: string;

  @Prop({ type: () => ObjectId })
  _customerId!: ObjectId;

  @Prop({ type: () => ObjectId })
  _resourceId!: ObjectId;

  isReflectedToInvoice() {
    return !!this._reflectedToInvoiceAt;
  }

  @Prop({
    default(this: DocumentType<ServiceUsage>) {
      const yyyymm = parseInt(
        formatDate(new Date(Date.now() + ONE_HOUR * 9), "%y%m")
      );
      return getInvoiceHashId(
        yyyymm,
        this._customerId,
        this.serviceProviderName
      );
    },
  })
  _invoiceHashId!: string;

  @Prop()
  isBillingTarget!: boolean;

  @Prop()
  _reflectedToInvoiceAt?: Date;

  @Prop({ type: Number })
  _reflectedAmount!: number;
}

export const ServiceUsageModel = getModelForClass(ServiceUsage, {
  schemaOptions: {
    collection: "Service.Usage",
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
});
