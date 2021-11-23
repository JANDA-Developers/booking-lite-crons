import { ResponseType } from './types'
import { DocumentType } from '@typegoose/typegoose'
import { ObjectId } from 'mongodb'
import {
  closeDBConnection,
  connectWithDB,
  executeWithDbSession
} from './helpers/dbHelper'

import {
  ProductBooking,
  PurchaseBundleModel,
  SettlementMallModel,
} from '@janda/bklite_models'
import { Paymethod, Status } from '../../../packages/bklite_commons/dist/enums'


// 트랜스퍼 취소 로직에서 이미 mall에 amount를 제하는 로직이 있다.
// 여기서는 calculated되지 않은 금액을 다 더해주면된다.
export const handler = async (): Promise<
ResponseType<Array<DocumentType<ProductBooking>>>
> => {
  console.log('START =================================================================')
  await connectWithDB(process.env.DB_URI ?? '')

  const data: Array<DocumentType<ProductBooking>> = []
  const execResult = await executeWithDbSession(async (session) => {
    interface PaymentInfo {
      _id: ObjectId
      amount: number
    }

    const calculationId = new ObjectId()
    const time = new Date()

    console.log('Exec ID =', calculationId.toHexString())
    console.log('exec date =', time.toISOString())


    //purchaseBundle Set
    await PurchaseBundleModel.updateMany({
      _isCalculatedToSettlement: {
        $ne: true
      },
      paymentStatus: Status.COMPLETED,
    },
    {
      $set: {
        _calculationForSettlementId: calculationId
      }
    }, {
      session
    })
    
    //purchase Set
    await PurchaseBundleModel.updateMany({
      _isCalculatedToSettlement: {
        $ne: true
      },
      paymethod: Paymethod.CARD,
      paymentStatus: Status.COMPLETED,
    },
    {
      $set: {
        _calculationForSettlementId: calculationId
      }
    }, {
      session
    })

    const list = await PurchaseBundleModel.aggregate<PaymentInfo>().match({
      _calculationForSettlementId: calculationId
    }).group({
      _id: '$_providerId',
      amount: {
        $sum: '$pricePaymentCompleted'
      }
    }).session(session ?? null)

    // TODO: 이제 Update문만 돌리면 됨!
    const bulkWriteResult = await SettlementMallModel.bulkWrite(list.map(item => ({
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

    list.forEach(item => {
      console.log(`${item._id.toHexString()} => ${item.amount} increased`)
    })
    const test: number = bulkWriteResult.modifiedCount ?? 0

    console.log(`${test} of data modified!`)
  })
  await closeDBConnection()
  console.log('END ==========================================================================')
  return {
    ...execResult,
    data
  }
}
