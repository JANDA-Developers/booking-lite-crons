import {
  DocumentType,
  getDiscriminatorModelForClass,
  mongoose,
  Prop
} from '@typegoose/typegoose'
import { ArrayMinSize } from 'class-validator'
import { pullAllWith } from 'lodash'
import { ObjectId } from 'mongodb'
import { ClientSession } from 'mongoose'
import { DayOfWeekToInt } from '../../enums'
import { DayOfWeek, ONE_HOUR, TimeMillies } from '../../utils/dateUtils'
import { TimeRange } from '../commonTypes/DateRange.type'
import { Tag } from '../commonTypes/Tag.type'
import {
  AbsProductAutomator,
  ProductAutomatorModel,
  ProductTemplate
} from '../_abstract/ProductAutomator/ProductAutomator.model'
import { Capacity, capacityToUsageDetails } from './Capacity.type'
import {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel
} from './Product.model'

export interface ITemplateGenerateParams {
  automatorId: ObjectId
  basedDate: Date
  index: number
  targetItemId: ObjectId
  ownerId: ObjectId
  tags?: Tag[]
}

export class ProductBookingTemplate extends ProductTemplate<ITemplateGenerateParams> {
  @Prop({ type: () => TimeRange, required: true, _id: false })
  timeRangeForUse!: TimeRange

  @Prop({ type: () => TimeRange, _id: false })
  timeRangeForSale?: TimeRange

  @Prop({ type: () => [Capacity], _id: false })
  capacityDetails: Capacity[] = []

  generate (input: ITemplateGenerateParams): ProductBooking {
    const {
      automatorId,
      basedDate,
      index,
      ownerId,
      targetItemId,
      tags
    } = input
    const automatorInfo = new ProductBookingAutomatorInfo({
      automatorId,
      basedDate,
      index,
      timeRangeForUse: this.timeRangeForUse,
      timeRangeForSale: this.timeRangeForSale
    })
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
      tags: tags ?? []
    })
    return temp
  }
}

export class ProductAutomatorBooking extends AbsProductAutomator<ProductBooking> {
  @ArrayMinSize(1)
  @Prop({ type: () => [ProductBookingTemplate], default: [] })
  templates!: ProductBookingTemplate[]

  @Prop()
  countDate!: number

  @Prop({ type: () => [Tag], default: [] })
  tags: Tag[] = []

  @Prop({ enum: DayOfWeek, default: [], type: mongoose.SchemaTypes.Number })
  exceptedDayOfWeeks: DayOfWeek[] = []

  /**
   * generate시에 생성될 Product 객체들을 반환한다.
   * @param time
   * @returns
   */
  async planGenerate (
    time: TimeMillies = Date.now()
  ): Promise<ProductBooking[]> {
    const basedDate = new Date(time + ONE_HOUR * this.timezone.offset)
    const productBookings: ProductBooking[] = []

    for (let index = 0; index < this.countDate; index++) {
      let bookings = this.templates.map((tpl) => {
        const temp = tpl.generate({
          automatorId: this._id,
          basedDate,
          index,
          ownerId: this.ownerId,
          targetItemId: this.targetItemId,
          tags: this.tags
        })

        temp.usageDetails = temp.capacityDetails.map(capacityToUsageDetails)
        return temp
      }
      )

      bookings = bookings.filter((booking) => {
        const dateRangeForUse = booking.dateRangeForUse
        if (dateRangeForUse?.from == null) {
          return false
        }
        const date = dateRangeForUse.from

        if (
          this.exceptedDayOfWeeks.some(
            (exceptDay) =>
              DayOfWeekToInt[exceptDay] ===
              new Date(date).getDay()
          )
        ) {
          return false
        }
        return true
      })
    }

    // 이미 생성되어있는 Product와 비교하여 중복 제거
    const products = pullAllWith(
      productBookings,
      await ProductBookingModel.find(
        {
          'automatorInfo.hashCode': {
            $in: productBookings.map((p) => p.automatorInfo?.hashCode ?? '')
          }
        },
        {
          'automatorInfo.hashCode': true
        }
      ),
      (prodOrigin, prodExisting) => {
        return (
          prodOrigin.automatorInfo?.hashCode ===
          prodExisting.automatorInfo?.hashCode
        )
      }
    )
    return products
  }

  async planDestroy (
    time: TimeMillies = Date.now()
  ): Promise<Array<DocumentType<ProductBooking>>> {
    const query = {
      'dateRangeForUse.from': {
        $gte: new Date(time - ONE_HOUR * this.timezone.offset).getTime()
      },
      'automatorInfo.automatorId': this._id,
      'usageDetails.usage': {
        $not: {
          $gt: 0
        }
      }
    }
    return await ProductBookingModel.find(query)
  }

  /**
   * DB에 업데이트함!
   * @param time
   * @param session
   * @returns
   */
  async generate (
    time: TimeMillies = Date.now(),
    session?: ClientSession
  ): Promise<Array<DocumentType<ProductBooking>>> {
    const productBookings: ProductBooking[] = await this.planGenerate(time)
    const results = await ProductBookingModel.insertMany(productBookings, {
      session,
      ordered: false
    })
    this.latestGenerate = time
    return results
  }

  async destroy (
    time: TimeMillies = Date.now(),
    session?: ClientSession
  ): Promise<Array<DocumentType<ProductBooking>>> {
    const deleteTargets = await this.planDestroy(time)
    const result = await ProductBookingModel.deleteMany(
      {
        _id: {
          $in: deleteTargets.map((t) => t._id)
        }
      },
      {
        session
      }
    )
    this.latestDestroy = time
    console.log(result)
    return deleteTargets
  }
}

export const ProductAutomatorBookingModel = getDiscriminatorModelForClass(
  ProductAutomatorModel,
  ProductAutomatorBooking
)
