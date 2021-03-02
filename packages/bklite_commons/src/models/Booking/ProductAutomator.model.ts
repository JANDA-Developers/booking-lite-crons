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
import { DayOfWeek, ONE_HOUR } from "../../utils/dateUtils";
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

  async generate(
    session?: ClientSession
  ): Promise<DocumentType<ProductBooking>[]> {
    const basedDate = new Date(Date.now() + ONE_HOUR * this.timezone.offset);
    const productBookings: ProductBooking[] = [];

    for (let index = 0; index < this.countDate; index++) {
      productBookings.push(
        ...this.templates.map((tpl) =>
          tpl.generate({
            automatorId: this._id,
            basedDate,
            index,
            ownerId: this.ownerId,
            targetItemId: this.targetItemId,
            tags: this.tags,
          })
        )
      );
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

    const results = await ProductBookingModel.insertMany(products, {
      session,
      ordered: false,
    });

    return results;
  }
  async destroy(
    session?: ClientSession,
    basedDate: Date = new Date()
  ): Promise<DocumentType<ProductBooking>[]> {
    // TODO: this.template.destroy?
    const query = {
      "dateRangeForUse.from": {
        $gte: new Date(
          basedDate.getTime() - ONE_HOUR * this.timezone.offset
        ).getTime(),
      },
      "automatorInfo.automatorId": this._id,
    };
    const productList = await ProductBookingModel.find(query).session(
      session || null
    );
    console.log({ query });
    return productList;
  }
}

export const ProductAutomatorBookingModel = getDiscriminatorModelForClass(
  ProductAutomatorModel,
  ProductAutomatorBooking
);
