import { Prop } from "@typegoose/typegoose";
import { IsDefined, Min } from "class-validator";

export class Capacity {
  @Prop()
  key!: string;

  @Prop()
  count!: number;

  @Prop()
  label!: string;

  @Prop()
  price!: number;
}

export class Usage {
  @Prop()
  @IsDefined()
  key!: string;

  @Prop()
  @IsDefined()
  label!: string;

  @Prop()
  @Min(0, { message: "음수값은 들어올수 없습니다." })
  count!: number;

  @Prop()
  @Min(0, { message: "음수값은 들어올수 없습니다." })
  price!: number;
}

export class CapacitySummary {
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
