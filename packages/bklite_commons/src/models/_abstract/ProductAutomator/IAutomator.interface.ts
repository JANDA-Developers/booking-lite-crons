import { ObjectId } from "mongodb";
import { ClientSession } from "mongoose";
import { Node } from "../../commonTypes/Node";
import { ServiceChargeTarget } from "../../Service/ServiceTarget.model";

export interface IAutomatorInfo {
  automatorId: ObjectId;
  index: number;
  basedDate: Date;
  calculatedDate: Date;
  toHashCode(): string;
}

export interface IAutomatable extends Node, ServiceChargeTarget {
  autoamtorInfo?: IAutomatorInfo;
}

export interface IAutomatorPayloadTemplate<T extends IAutomatable, P = any> {
  generate(input?: P): T;
}

export interface IAutomator<T extends IAutomatable>
  extends Node,
    ServiceChargeTarget {
  templates: IAutomatorPayloadTemplate<T>[];
  generate(session?: ClientSession): Promise<IAutomatable[]>;
  destroy(session?: ClientSession): Promise<IAutomatable[]>;
}
