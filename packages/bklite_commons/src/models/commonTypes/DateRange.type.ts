import { DocumentType, Prop } from "@typegoose/typegoose";
import { MongoLong } from "../../types";
import { hhmm24, TimeMillies } from "../../utils/dateUtils";

export class DateRange {
  @Prop({
    type: MongoLong,
    required(this: DocumentType<DateRange>) {
      return !this.to;
    },
  })
  from?: TimeMillies;

  @Prop({
    type: MongoLong,
    required(this: DocumentType<DateRange>) {
      return !this.from;
    },
  })
  to?: TimeMillies;
}

export class TimeRange {
  @Prop({ required: true })
  start!: hhmm24;

  @Prop({ required: true })
  end!: hhmm24;
}
