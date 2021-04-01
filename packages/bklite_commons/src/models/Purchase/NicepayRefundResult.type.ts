import { Prop } from '@typegoose/typegoose'

export class NicepayRefundResult {
  @Prop()
  ResultCode!: string

  @Prop()
  ResultMsg!: string

  @Prop()
  CancelAmt!: number

  @Prop()
  MID!: string

  @Prop()
  Moid!: string

  @Prop()
  PayMethod!: string

  @Prop()
  TID!: string

  @Prop()
  CancelDate!: string

  @Prop()
  CancelTime!: string

  @Prop()
  RemainAmt!: number
}
