import { getModelForClass, Prop, Severity } from '@typegoose/typegoose'
import { Currency, ItemType, Paymethod, Status } from '../../enums'
import { ObjectId } from 'mongodb'
import { Attribute } from '../commonTypes/Attribute.type'
import { Product } from '../_abstract/Product/Product.model'
import { NicepayPayResult } from './NIcepayPayResult.type'

abstract class PaymentStrategy {
  @Prop()
  paymentStatus!: Status

  @Prop()
  refundStatus?: Status

  @Prop()
  paymethod!: Paymethod

  @Prop()
  paymentExpiresAt?: Date

  @Prop()
  currency?: Currency

  @Prop()
  pricePaymentPending: number = 0

  @Prop()
  pricePaymentCompleted: number = 0

  @Prop()
  priceRefundPending: number = 0

  @Prop()
  priceRefundCompleted: number = 0

  @Prop()
  isFullRefunded?: boolean

  @Prop()
  isRefundedPartial?: boolean

  @Prop()
  message?: string

  @Prop()
  nicepayPayResult?: NicepayPayResult
}

export class IPurchase extends PaymentStrategy {
  @Prop({ enum: Status })
  status!: Status

  @Prop()
  isPaymentCompleted?: boolean

  @Prop()
  count!: number

  @Prop({ type: () => Product })
  purchasedProduct!: Product

  @Prop()
  purchaserName!: string

  @Prop()
  purchaserContact!: string

  @Prop({ enum: ItemType })
  type!: ItemType

  @Prop({
    type: () => [Attribute],
    _id: false
  })
  attrs!: Attribute[]

  @Prop()
  itemName!: string

  @Prop({ type: ObjectId })
  _itemId!: ObjectId

  @Prop()
  _purchaseBundleId!: ObjectId

  @Prop({ type: () => ObjectId })
  _productId!: ObjectId

  @Prop({ type: () => ObjectId })
  _customerId!: ObjectId

  @Prop({ type: () => ObjectId })
  _providerId!: ObjectId

  @Prop({ type: () => ObjectId })
  _storeId!: ObjectId

  @Prop()
  _isCalculatedToSettlement?: boolean // settlement.amount에 반영이 되었는가?

  @Prop({ type: () => ObjectId })
  _calculationForSettlementId?: ObjectId

  @Prop()
  paymentStatus!: Status
}

export const PurchaseModel = getModelForClass(IPurchase, {
  options: {
    allowMixed: Severity.ALLOW
  },
  schemaOptions: {
    collection: 'Purchase',
    timestamps: true
  }
})
