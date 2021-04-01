import {
  getModelForClass,
  Prop,
  Severity
} from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import { BankCode, Status } from '../../enums'

export class Settlement {
  @Prop()
  amount!: number

  @Prop()
  message!: string

  @Prop()
  settlementDate!: Date

  @Prop()
  submallId!: string

  @Prop()
  sequence!: string

  @Prop()
  canceledAt!: Date

  @Prop({ enum: Status })
  status!: Status

  @Prop()
  accountHolder!: string

  @Prop()
  accountNumber!: string

  @Prop()
  bankCode!: BankCode

  @Prop({ default: Date.now })
  latestRefresh!: Date

  @Prop()
  settlementMallHashId!: string

  @Prop()
  _settlementMallId!: ObjectId

  @Prop({ type: () => ObjectId })
  _ownerId!: ObjectId
}

export const SettlementModel = getModelForClass(Settlement, {
  schemaOptions: {
    collection: 'Settlement.History',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
