import {
  getDiscriminatorModelForClass,
  getModelForClass,
  Prop,
  Severity
} from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'

export class SettlementMallPlain {
  @Prop()
  description?: string
}

export class SettlementMall {
  @Prop({ type: () => ObjectId, unique: true })
  _ownerId!: ObjectId

  @Prop()
  currentAmount!: number
}

export const SettlementMallPlainModel = getModelForClass(SettlementMallPlain, {
  schemaOptions: {
    collection: 'Settlement.Mall',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})

export const SettlementMallModel = getDiscriminatorModelForClass(
  SettlementMallPlainModel,
  SettlementMall
)
