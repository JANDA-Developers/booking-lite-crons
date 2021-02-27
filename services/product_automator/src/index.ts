import { EventType, ResponseType } from "./types";
import { ProductAutomator } from "@janda/bklite_models";
import { ObjectId } from "mongodb";

export const handler = async (event: EventType): Promise<ResponseType> => {
  // TODO Something
  return {
    ok: true,
    errors: null,
    data: event.greeting,
  };
};
