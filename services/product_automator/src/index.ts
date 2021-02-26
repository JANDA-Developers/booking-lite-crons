import { EventType, ResponseType } from "./types";
import { ProductAutomator } from "@janda/bklite_models";
import { ObjectId } from "mongodb";

export const handler = async (event: EventType): Promise<ResponseType> => {
  console.log(
    Object.assign(new ProductAutomator(), {
      name: "Hello",
      ownerId: new ObjectId(),
      description: "Test",
      productParams: [
        {
          attrs: [
            {
              key: "Hello",
              value: "World",
            },
          ],
          capacity: 20,
          price: 17000,
        },
      ],
    } as ProductAutomator)
  );
  return {
    ok: true,
    errors: null,
    data: event.greeting,
  };
};

const main = () => {
  console.log(
    handler({
      greeting: "Hi!",
    })
  );
};

main();
