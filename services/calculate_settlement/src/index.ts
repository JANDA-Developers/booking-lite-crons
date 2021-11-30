import { ResponseType } from "./types";
import { DocumentType } from "@typegoose/typegoose";
import {
 closeDBConnection,
 connectWithDB,
 executeWithDbSession,
} from "./helpers/dbHelper";

import { ProductBooking } from "@janda/bklite_models";
import { caculateSettlement } from "./helpers/caclulateSettlement";

export const handler = async (): Promise<
 ResponseType<Array<DocumentType<ProductBooking>>>
> => {
 console.log(
  "START ================================================================="
 );
 await connectWithDB(process.env.DB_URI ?? "");

 const data: Array<DocumentType<ProductBooking>> = [];
 const execResult = await executeWithDbSession(caculateSettlement);
 await closeDBConnection();
 console.log(
  "END =========================================================================="
 );
 return {
  ...execResult,
  data,
 };
};
