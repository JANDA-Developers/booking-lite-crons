import { mongoose } from "@typegoose/typegoose";

export const MongoLong = (mongoose.Schema.Types as any).Long;
