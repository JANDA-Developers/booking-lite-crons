import {
  DocumentType,
  getDiscriminatorModelForClass,
  mongoose,
  Prop,
} from "@typegoose/typegoose";
import { ArrayMinSize } from "class-validator";
import { pullAllWith } from "lodash";
import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { DayOfWeekToInt } from "../../enums";
import { DayOfWeek, ONE_HOUR, TimeMillies } from "../../utils/dateUtils";
import { TimeRange } from "../commonTypes/DateRange.type";
import { Tag } from "../commonTypes/Tag.type";
import {
  AbsProductAutomator,
  ProductAutomatorModel,
  ProductTemplate,
} from "../_abstract/ProductAutomator/ProductAutomator.model";
import { Capacity } from "./Capacity.type";
import {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel,
} from "./Product.model";

export interface ITemplateGenerateParams {
  automatorId: ObjectId;
  basedDate: Date;
  index: number;
  targetItemId: ObjectId;
  ownerId: ObjectId;
  _storeId: ObjectId;
  tags?: Tag[];
}

export class ProductBookingTemplate extends ProductTemplate<ITemplateGenerateParams> {
  @Prop({ type: () => TimeRange, required: true, _id: false })
  timeRangeForUse!: TimeRange;

  @Prop({ type: () => TimeRange, _id: false })
  timeRangeForSale?: TimeRange;

  @Prop({ type: () => [Capacity], _id: false })
  capacityDetails: Capacity[] = [];

  generate(input: ITemplateGenerateParams): ProductBooking {
    const {
      automatorId,
      basedDate,
      index,
      ownerId,
      targetItemId,
      tags,
      _storeId,
    } = input;
    const automatorInfo = new ProductBookingAutomatorInfo({
      automatorId,
      basedDate,
      index,
      timeRangeForUse: this.timeRangeForUse,
      timeRangeForSale: this.timeRangeForSale,
    });
    const temp = Object.assign(new ProductBooking(), {
      _id: new ObjectId(),
      code: ProductBooking.generateCode(),
      dateRangeForUse: this.timeRangeForUse.toDateRange(
        automatorInfo.calculatedDate.getTime()
      ),
      dateRangeForSale: this.timeRangeForSale?.toDateRange(
        automatorInfo.calculatedDate.getTime()
      ),
      capacity: this.capacity,
      currency: this.currency,
      attrs: this.attrs,
      price: this.price,
      capacityPick: this.capacityPick,
      capacityDetails: this.capacityDetails,
      _itemId: targetItemId,
      automatorInfo,
      _storeId,
      _ownerId: ownerId,
      tags: tags || [],
    } as ProductBooking);
    return temp;
  }
}

export class ProductAutomatorBooking extends AbsProductAutomator<ProductBooking> {
  @ArrayMinSize(1)
  @Prop({ type: () => [ProductBookingTemplate], default: [] })
  templates!: ProductBookingTemplate[];

  @Prop()
  countDate!: number;

  @Prop({ type: () => [Tag], default: [] })
  tags: Tag[] = [];

  @Prop({ enum: DayOfWeek, default: [], type: mongoose.SchemaTypes.Number })
  exceptedDayOfWeeks: DayOfWeek[] = [];

  @Prop({ default: new ObjectId() })
  _storeId!: ObjectId;


  async planGenerate(
    time: TimeMillies = Date.now()
  ): Promise<ProductBooking[]> {
    const basedDate = new Date(time + ONE_HOUR * this.timezone.offset);
    const productBookings: ProductBooking[] = [];

    
    for (let index = 0; index < this.countDate; index++) {
      let bookings = this.templates.map((tpl) =>
          tpl.generate({
              automatorId: this._id,
              basedDate,
              index,
              ownerId: this.ownerId,
              targetItemId: this.targetItemId,
              _storeId: this._storeId,
              tags: this.tags,
          })
      );

      bookings = bookings.filter((booking) => {
          if (!booking.dateRangeForUse?.from) return false;
          const date = booking.dateRangeForUse.from;

          if (
              this.exceptedDayOfWeeks.some(
                  (exceptDay) =>
                      DayOfWeekToInt[exceptDay] ===
                      new Date(date).getDay()
              )
          ) {
              return false;
          }
          return true;
      });
    }


    const products = pullAllWith(
      productBookings,
      await ProductBookingModel.find(
        {
          "automatorInfo.hashCode": {
            $in: productBookings.map((p) => p.automatorInfo?.hashCode || ""),
          },
        },
        {
          "automatorInfo.hashCode": true,
        }
      ),
      (prodOrigin, prodExisting) => {
        return (
          prodOrigin.automatorInfo?.hashCode ===
          prodExisting.automatorInfo?.hashCode
        );
      }
    );
    return products;
  }
  async planDestroy(
    time: TimeMillies = Date.now()
  ): Promise<DocumentType<ProductBooking>[]> {
    const query = {
      "dateRangeForUse.from": {
        $gte: new Date(time - ONE_HOUR * this.timezone.offset).getTime(),
      },
      "automatorInfo.automatorId": this._id,
      "usageDetails.usage": {
        $not: {
          $gt: 0,
        },
      },
    };
    return ProductBookingModel.find(query);
  }

  async generate(
    time: TimeMillies = Date.now(),
    session?: ClientSession
  ): Promise<DocumentType<ProductBooking>[]> {
    const productBookings: ProductBooking[] = await this.planGenerate(time);
    const results = await ProductBookingModel.insertMany(productBookings, {
      session,
      ordered: false,
    });
    this.latestGenerate = time;
    return results;
  }
  async destroy(
    time: TimeMillies = Date.now(),
    session?: ClientSession
  ): Promise<DocumentType<ProductBooking>[]> {
    const deleteTargets = await this.planDestroy(time);
    const result = await ProductBookingModel.deleteMany(
      {
        _id: {
          $in: deleteTargets.map((t) => t._id),
        },
      },
      {
        session,
      }
    );
    this.latestDestroy = time;
    console.log(result);
    return deleteTargets;
  }
}

export const ProductAutomatorBookingModel = getDiscriminatorModelForClass(
  ProductAutomatorModel,
  ProductAutomatorBooking
);
