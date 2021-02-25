import {
  DocumentType,
  getDiscriminatorModelForClass,
  Pre,
  Prop,
} from "@typegoose/typegoose";
import {
  Capacity,
  CapacitySummary,
  capacityToUsageDetails,
} from "./Capacity.type";
import { ArrayMinSize } from "class-validator";
import { Currency, ProductType } from "../../enums";
import { Product, ProductModel } from "../_abstract/Product/Product.model";
import { DateRange } from "../commonTypes/DateRange.type";

@Pre("save", async function (this: DocumentType<ProductBooking>, next) {
  const capacity = this.capacityDetails;
  this.usageDetails = capacity.map(capacityToUsageDetails);
  next();
})
export class ProductBooking extends Product {
  get typeSet() {
    return ProductType.BOOKING;
  }

  @Prop()
  disabled?: boolean;

  @Prop({ type: () => DateRange })
  dateRangeForSale?: DateRange;

  @Prop({ type: () => DateRange })
  dateRangeForUse?: DateRange;

  @Prop({ required: true })
  currency!: Currency;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  capacity!: number;

  @Prop()
  capacityPick?: number;

  @Prop({ type: () => [Capacity], default: [] })
  capacityDetails: Capacity[] = [];

  @Prop({ type: () => [CapacitySummary], _id: false })
  @ArrayMinSize(1)
  usageDetails!: CapacitySummary[];
}

export const ProductBookingModel = getDiscriminatorModelForClass(
  ProductModel,
  ProductBooking
);
