import { mongoose } from "@typegoose/typegoose";
import { ClientSession } from "mongodb";

export const connectWithDB = async (uri: string): Promise<void> =>
 await mongoose
  .connect(uri, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false,
  })
  .then(async () => {
   console.log("DB Connected!");
  })
  .catch((err) => {
   console.error("DB Connection Error!!!");
   console.log(err);
  });

export const closeDBConnection = async (): Promise<void> =>
 await mongoose.connection.close();

interface ExecuteWithDbSessionReturn {
 ok: boolean;
 error: any;
}
export const executeWithDbSession = async (
 cb: (session?: ClientSession) => Promise<void>
): Promise<ExecuteWithDbSessionReturn> => {
 const session = await mongoose.startSession();
 try {
  await session.withTransaction(cb);
 } catch (error) {
  console.error(error);
  return {
   ok: false,
   error,
  };
 } finally {
  session.endSession();
 }
 return {
  ok: true,
  error: null,
 };
};
