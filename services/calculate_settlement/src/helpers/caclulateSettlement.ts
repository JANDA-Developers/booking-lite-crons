import { Prop, getModelForClass } from "@typegoose/typegoose";
import cryptoRandomString from "crypto-random-string";
import { ObjectId } from "mongodb";

export class PurchaseBundle {
 @Prop({
  default: () =>
   "BOOK-" +
   cryptoRandomString({
    type: "distinguishable",
    length: 6,
   }),
  unique: true,
 })
 code!: string;

 @Prop({ default: process.env.SERVICE_PROVIDER_NAME ?? "JANDA" })
 serviceProviderName!: string;

 @Prop()
 isPaymentCompleted?: boolean;

 @Prop()
 fullRefundPendingAt?: Date;

 @Prop()
 fullRefundCompletedAt?: Date;

 @Prop()
 paymentStatus?: Status;

 @Prop()
 refundStatus?: Status;

 status(): Status {
  if (this.paymentStatus === Status.COMPLETED) {
   if (this.refundStatus == null) {
    return Status.COMPLETED;
   }
   return Status.CANCELED;
  }
  return Status.PENDING;
 }

 @Prop()
 paymentAt?: Date;

 @Prop()
 useNicepay!: boolean;

 @Prop()
 purchaserName!: string;

 @Prop()
 purchaserContact!: string;

 @Prop()
 purchaserMessage!: string;

 @Prop()
 sellerMemo?: string;

 @Prop({ default: false })
 _isCalculatedToSettlement?: boolean; // settlement.amount에 반영이 되었는가?

 @Prop({ type: () => ObjectId })
 _calculationForSettlementId?: ObjectId; // settlement.amount에 반영이 되었는가?

 @Prop({ type: () => ObjectId })
 _storeId!: ObjectId;

 @Prop({ type: () => ObjectId })
 _sellerId!: ObjectId;

 @Prop({ type: () => ObjectId })
 _customerId!: ObjectId;

 @Prop({ type: () => [ObjectId] })
 _purchaseIds!: ObjectId[];

 @Prop({ type: () => [ObjectId] })
 _purchaseItemIds!: ObjectId[];
}
export const PurchaseBundleModel = getModelForClass(PurchaseBundle, {
 schemaOptions: {
  collection: "PurchaseBundle",
  timestamps: true,
 },
});

export class SettlementMallPlain {
 @Prop()
 description?: string;
}

export class SettlementMall {
 @Prop({ type: () => ObjectId, unique: true })
 _ownerId!: ObjectId;

 @Prop()
 amount!: number;
}

export const SettlementMallModel = getModelForClass(SettlementMall, {
 schemaOptions: {
  collection: "Settlement.Mall",
  timestamps: true,
 },
});

export enum Status {
 PENDING = "PENDING",
 COMPLETED = "COMPLETED",
 CANCELED = "CANCELED",
}
export enum Paymethod {
 NON_PAY = "NON_PAY",
 CASH = "CASH",
 CARD = "CARD",
 BANK_TRANSFER = "BANK_TRANSFER",
 PAY_PAL = "PAY_PAL",
 KAKAO = "KAKAO",
 NAVER = "NAVER",
 SAMSUNG = "SAMSUNG",
 VBANK = "VBANK",
 OFFLINE = "OFFLINE",
}

interface PaymentInfo {
 _id: ObjectId;
 amount: number;
}

export const caculateSettlement = async (session: any) => {
 const calculationId = new ObjectId();
 const time = new Date();

 console.log("Exec ID =", calculationId.toHexString());
 console.log("exec date =", time.toISOString());

 const targetCnt = await markCaculateTarget(calculationId, session);
 console.log("marked documentCnt =", targetCnt);
 const calculatedList = await calculate(calculationId, session);
 console.log("calculatedList documentCnt =", calculatedList.length);
 const bulkWriteResult = await writeResutInMall(calculatedList, session);
 createCalculateLog(calculatedList, bulkWriteResult);
};

export const markCaculateTarget = async (calculationId: any, session: any) =>
 await PurchaseBundleModel.updateMany(
  {
   _isCalculatedToSettlement: {
    $ne: true,
   },
   paymethod: {
    $in: [
     Paymethod.NAVER,
     Paymethod.KAKAO,
     Paymethod.SAMSUNG,
     Paymethod.VBANK,
     Paymethod.CARD,
    ],
   },
   paymentStatus: {
    $ne: Status.PENDING,
   },
  },
  {
   $set: {
    _isCalculatedToSettlement: true,
    _calculationForSettlementId: calculationId,
   },
  },
  {
   upsert: true,
   strict: false,
   session,
  }
 );
//  arn:aws:lambda:ap-northeast-2:068549478648
export const calculate = async (calculationId: any, session: any) =>
 await PurchaseBundleModel.aggregate<PaymentInfo>()
  .match({
   _calculationForSettlementId: calculationId,
  })
  .group({
   _id: "$_sellerId",
   amount: {
    // 환불할때 Settlement 에서 뺀다. 따라서 완료된 금액만 더한다.
    $sum: "$pricePaymentCompleted",
   },
  })
  .session(session ?? null);

export const writeResutInMall = async (
 calculatedList: PaymentInfo[],
 session: any
) => {
 return await SettlementMallModel.bulkWrite(
  calculatedList.map((item) => ({
   updateOne: {
    filter: {
     _ownerId: item._id,
    },
    update: {
     $inc: {
      amount: Math.floor(item.amount) - item.amount * 0.034,
     },
    },
   },
  })),
  {
   session,
  }
 );
};

export const createCalculateLog = (
 calculatedList: PaymentInfo[],
 bulkWriteResult: any
) => {
 calculatedList.forEach((item: any) => {
  console.log(`${item._id.toHexString()} => ${item.amount} increased`);
 });
 const test: number = bulkWriteResult.modifiedCount ?? 0;

 console.log(`${test} of data modified!`);
};
