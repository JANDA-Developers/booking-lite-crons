import {
  getDiscriminatorModelForClass,
  mongoose,
  Prop,
} from "@typegoose/typegoose";
import { ArrayMinSize } from "class-validator";
import { ObjectId } from "mongodb";
import { ProductType } from "../../enums";
import { DayOfWeek } from "../../utils/dateUtils";
import { TimeRange } from "../commonTypes/DateRange.type";
import {
  ProductAutomator,
  ProductAutomatorModel,
  ProductParam,
} from "../_abstract/ProductAutomator/ProductAutomator.model";
import { Capacity } from "./Capacity.type";

export class ProductBookingParam extends ProductParam {
  @Prop()
  capacityPick?: number;

  @Prop({ type: () => [Capacity], _id: false, default: [] })
  capacityDetails!: Capacity[];

  @Prop({ type: () => TimeRange, _id: false })
  timeRangeForUse?: TimeRange;

  @Prop({ type: () => TimeRange, _id: false })
  timeRangeForSales?: TimeRange;
}

export interface ProductAutomatorBooking extends ProductAutomator {
  isDisabled?: boolean; // 켜고 끈다..

  name: string;

  description?: string;

  // 생성할 ProductType
  type: ProductType;

  // 목표한 ItemId
  targetItemId: ObjectId;

  // Item OwnerId => BusienssUser
  ownerId: ObjectId;

  // 실제 생성될 Product 파라미터
  productParams: ProductBookingParam[];

  // Cron 시점으로부터 몇일까지 생성? => ProductBooking.dateRangeForUse에 반영됨
  dateCount: number;

  // 생성 제외할 요일
  dayOfWeekExceptions?: DayOfWeek[];
}

export class TimeSetting {
  @Prop({ type: () => TimeRange, required: true })
  timeRange!: TimeRange;

  @Prop()
  intervalMinute?: number;
}

export class ProductAutomatorBooking extends ProductAutomator {
  @Prop({ enum: ProductType, default: ProductType.BOOKING, required: true })
  type!: ProductType;

  @Prop({
    type: () => [ProductBookingParam],
    _id: false,
    required: true,
    default: [],
  })
  @ArrayMinSize(1)
  productParams!: ProductBookingParam[];

  @Prop({ required: true })
  dateCount!: number;

  @Prop({ enum: DayOfWeek, type: mongoose.SchemaTypes.Number })
  dayOfWeekExceptions?: DayOfWeek[];
}

export const ProductAutomatorBookingModel = getDiscriminatorModelForClass(
  ProductAutomatorModel,
  ProductAutomatorBooking
);
