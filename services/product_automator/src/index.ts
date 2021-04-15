import { ResponseType } from './types'
import { DocumentType } from '@typegoose/typegoose'
import { ClientSession } from 'mongodb'
import {
  closeDBConnection,
  connectWithDB,
  executeWithDbSession
} from './helpers/dbHelper'

import {
  ProductAutomatorBooking,
  ProductAutomatorBookingModel,
  ProductBooking
} from '@janda/bklite_models'

export const handler = async (): Promise<
ResponseType<Array<DocumentType<ProductBooking>>>
> => {
  await connectWithDB(process.env.DB_URI ?? '')

  const data: Array<DocumentType<ProductBooking>> = []
  const time = Date.now()
  const execResult = await executeWithDbSession(async (session) => {
    const productAutomatorList = await findAutomators();
    (
      await Promise.all(
        productAutomatorList.map(
          async (automator) => await automator.generate(time, session)
        )
      )
    ).forEach((productList) => data.push(...productList))
  })
  await closeDBConnection()
  return {
    ...execResult,
    data
  }
}

export const findAutomators = async (session?: ClientSession): Promise<Array<DocumentType<ProductAutomatorBooking>>> =>
  await ProductAutomatorBookingModel.find({
    isDeleted: { $ne: true }
  }).session(session ?? null)
