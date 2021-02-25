import { Prop } from "@typegoose/typegoose";
import { Base } from "@typegoose/typegoose/lib/defaultClasses";

export class Node extends Base {
  constructor(args?: any) {
    super();
    if (args) {
      for (const key in args) {
        const element = args[key];
        this[key] = element;
      }
    }
  }
  @Prop()
  readonly createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop()
  isDeleted?: boolean;
}
