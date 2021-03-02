import { ResponseType } from "./types";
import { DocumentType } from "@typegoose/typegoose";
import { ClientSession } from "mongodb";
import {
  closeDBConnection,
  connectWithDB,
  executeWithDbSession,
} from "./helpers/dbHelper";

import {
  ProductAutomatorBookingModel,
  ProductBooking,
} from "@janda/bklite_models";

export const handler = async (): Promise<
  ResponseType<Array<DocumentType<ProductBooking>>>
> => {
  const DB_URI = process.env.DB_URI || "";
  await connectWithDB(DB_URI);

  const data: DocumentType<ProductBooking>[] = [];
  const execResult = await executeWithDbSession(async (session) => {
    const productAutomatorList = await findAutomators();
    (
      await Promise.all(
        productAutomatorList.map(
          async (automator) => await automator.generate(session)
        )
      )
    ).forEach((productList) => data.push(...productList));
  });
  await closeDBConnection();
  return {
    ...execResult,
    data,
  };
};

export const findAutomators = async (session?: ClientSession) =>
  ProductAutomatorBookingModel.find({
    isDeleted: { $ne: true },
  }).session(session || null);
