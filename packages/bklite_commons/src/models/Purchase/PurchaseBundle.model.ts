import { getModelForClass, Prop, Severity } from '@typegoose/typegoose'
import cryptoRandomString from 'crypto-random-string'
import { ObjectId } from 'mongodb'
import { Status } from '../../enums'
import { Attribute } from '../commonTypes/Attribute.type'
import { NicepayRefundResult } from './NicepayRefundResult.type'

export class PurchaseBundle {
  @Prop({
    default: () =>
      'BOOK-' +
            cryptoRandomString({
              type: 'distinguishable',
              length: 6
            }),
    unique: true
  })
  code!: string

  @Prop({ default: process.env.SERVICE_PROVIDER_NAME ?? 'JANDA' })
  serviceProviderName!: string

  @Prop()
  isPaymentCompleted?: boolean

  @Prop()
  fullRefundPendingAt?: Date

  @Prop()
  fullRefundCompletedAt?: Date

  @Prop()
  paymentStatus?: Status

  @Prop()
  refundStatus?: Status

  status (): Status {
    if (this.paymentStatus === Status.COMPLETED) {
      if (this.refundStatus == null) {
        return Status.COMPLETED
      }
      return Status.CANCELED
    }
    return Status.PENDING
  }

  @Prop()
  paymentAt?: Date

  @Prop({ type: () => [NicepayRefundResult] })
  nicepayRefundResult?: NicepayRefundResult[]

  @Prop({ type: () => [Attribute] })
  attrs!: Attribute[]

  @Prop()
  useNicepay!: boolean

  @Prop()
  purchaserName!: string

  @Prop()
  purchaserContact!: string

  @Prop()
  purchaserMessage!: string

  @Prop()
  sellerMemo?: string

  @Prop({ type: () => ObjectId })
  _storeId!: ObjectId

  @Prop({ type: () => ObjectId })
  _sellerId!: ObjectId

  @Prop({ type: () => ObjectId })
  _customerId!: ObjectId

  @Prop({ type: () => [ObjectId] })
  _purchaseIds!: ObjectId[]

  @Prop({ type: () => [ObjectId] })
  _purchaseItemIds!: ObjectId[]
}

export const PurchaseBundleModel = getModelForClass(PurchaseBundle, {
  options: {
    allowMixed: Severity.ALLOW
  },
  schemaOptions: {
    collection: 'PurchaseBundle',
    timestamps: true
  }
})
