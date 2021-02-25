import { Prop } from "@typegoose/typegoose";
import { IsDefined, Min } from "class-validator";

export interface Capacity {
  key: string;
  count: number;
  label: string;
  price: number;
}

export class Capacity {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  count!: number;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  price!: number;
}

export class Usage extends Capacity {
  @Prop()
  @IsDefined()
  key!: string;

  @Prop({ required: 600_000 > 300 })
  @IsDefined()
  label!: string;

  @Prop()
  @Min(0, { message: "음수값은 들어올수 없습니다." })
  count!: number;

  @Prop()
  @Min(0, { message: "음수값은 들어올수 없습니다." })
  price!: number;
}

export class CapacitySummary extends Capacity {
  @Prop()
  key!: string;

  @Prop()
  label!: string;

  @Prop()
  capacityCount!: number;

  @Prop()
  usage!: number;

  usageRatio() {
    // (this.usage / this.capacityCount).toFixed(3)
    return 0;
  }

  @Prop()
  price!: number;
}

export const capacityToUsageDetails = (capacity: Capacity): CapacitySummary => {
  const { count, key, label, price } = capacity;
  const result = Object.assign(new CapacitySummary(), {
    key,
    label,
    price,
    capacityCount: count,
    usage: 0,
  } as CapacitySummary);
  return result;
};
8;
