import { ObjectId } from "mongodb";
import {
  PurchaseModel,
  SettlementMallModel,
} from '@janda/bklite_models'
import { Status } from '../../../../packages/bklite_commons/dist/enums'

export const caculateSettlement = async (session: any) => {
  interface PaymentInfo {
    _id: ObjectId
    amount: number
  }

  const calculationId = new ObjectId()
  const time = new Date()

  console.log('Exec ID =', calculationId.toHexString())

  console.log('exec date =', time.toISOString())

  await PurchaseModel.updateMany({
    _isCalculatedToSettlement: {
      $ne: true
    },
    paymentStatus: Status.COMPLETED,
    status: {
      $ne: Status.CANCELED
    }
  },
    {
      $set: {
        _calculationForSettlementId: calculationId
      }
    }, {
    session
  })
    
  await PurchaseModel.updateMany({
    _isCalculatedToSettlement: {
      $ne: true
    },
    paymentStatus: Status.COMPLETED,
    status: {
      $ne: Status.CANCELED
    }
  },
    {
      $set: {
        _calculationForSettlementId: calculationId
      }
    }, {
    session
  })

  const list = await PurchaseModel.aggregate<PaymentInfo>().match({
    _calculationForSettlementId: calculationId
  }).group({
    _id: '$_providerId',
    amount: {
      //의문 1 이거 로직이 맞음? ??? refund 떄문에 안맞는거 같은데? 
      $sum: '$pricePaymentCompleted'
    }
  }).session(session ?? null)

  // TODO: 이제 Update문만 돌리면 됨!
  const bulkWriteResult = await SettlementMallModel.bulkWrite(list.map((item:any) => ({
    updateOne: {
      filter: {
        _ownerId: item._id
      },
      update: {
        $inc: {
          amount: item.amount
        }
      }
    }
  })), {
    session
  })

    // TODO !!! 이거 purchase 가 아니라 
    // purchaseBundle을 사용해서 업데이트 시켜줘야함.
    // 같은 로직으로 그대로 옴기면 될듯 ?

    list.forEach((item:any) => {
      console.log(`${item._id.toHexString()} => ${item.amount} increased`)
    })
    const test: number = bulkWriteResult.modifiedCount ?? 0

    console.log(`${test} of data modified!`)

}