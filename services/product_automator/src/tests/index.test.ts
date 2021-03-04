import path from "path";
import dotenv from "dotenv";
dotenv.config({
  path: path.join(__dirname, ".env.test"),
});
import {
  ProductAutomatorBookingModel,
  ProductBooking,
} from "@janda/bklite_models";
import {
  closeDBConnection,
  connectWithDB,
  executeWithDbSession,
} from "../helpers/dbHelper";
import { DocumentType } from "@typegoose/typegoose";

beforeAll(async () => {
  await connectWithDB(process.env.DB_URI || "");
});

afterAll(async () => {
  await closeDBConnection();
});

describe("Test", () => {
  test("GenerateProduct", async () => {
    const data: DocumentType<ProductBooking>[] = [];
    const result = await executeWithDbSession(async (session) => {
      const productAutomatorList = await ProductAutomatorBookingModel.find({
        isDeleted: { $ne: true },
      }).session(session || null);
      (
        await Promise.all(
          productAutomatorList.map(
            async (automator) => await automator.generate(session)
          )
        )
      ).forEach((productList) => data.push(...productList));
    });
    console.log({ data });
    expect({ ...result, data }).toMatchObject({
      ok: true,
      error: null,
      data: expect.any(Array),
    });
  });

  test("DestroyProduct", async () => {
    // TODO: Destroy Test ㄱㄱ
    const productAutomatorList = await ProductAutomatorBookingModel.find();
    const basedDate = new Date();
    await executeWithDbSession(async (session) => {
      const r = await Promise.all(
        productAutomatorList.map(async (automator) => {
          return automator.destroy(session, basedDate);
        })
      );
      console.table(r);
    });
    expect({ productAutomatorList }).toMatchObject({
      productAutomatorList: expect.any(Array),
    });
  });
});
