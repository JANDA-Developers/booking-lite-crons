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
  PurchaseModel,
  SettlementMallModel
} from '@janda/bklite_models'
import { Status } from '../../../packages/bklite_commons/dist/enums'

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
