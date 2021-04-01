import { Prop } from '@typegoose/typegoose'

export class NicepayPayResult {
  @Prop()
  ResultCode!: '3001' | '4000' | '4100' | 'A000' | '7001'

  @Prop()
  ResultMsg!: string

  @Prop()
  Amt!: number

  @Prop()
  MID!: string

  @Prop()
  Moid!: string

  @Prop()
  BuyerEmail!: string

  @Prop()
  BuyerTel!: string

  @Prop()
  BuyerName!: string

  @Prop()
  GoodsName!: string

  @Prop()
  TID!: string

  @Prop()
  AuthCode!: string

  @Prop()
  AuthDate!: string

  @Prop()
  PayMethod!: 'CARD' | 'BANK' | 'VBANK' | 'CELLPHONE'

  @Prop()
  CardCode!: string

  @Prop()
  CardName!: string

  @Prop()
  CardNo!: string

  @Prop()
  CardQuota!: string

  @Prop()
  CardInterest!: 0 | 1

  @Prop()
  AcquCardCode!: string

  @Prop()
  AcquCardName!: string

  @Prop()
  CardCl!: 0 | 1

  @Prop()
  CcPartCl!: 0 | 1

  @Prop()
  PointAppAmt!: number

  @Prop()
  ClickpayCl?: 6 | 8 | 15 | 16 | 0
}
