import { ClientSession } from "mongoose";
import {
  ServiceChargeTarget,
  ServiceUsage,
  ServiceUsageModel,
} from "./ServiceTarget.model";
import { Action, ServiceUsageType } from "../../enums";

export type ChargeUsageFunctionType = (
  resource: ServiceChargeTarget,
  action: Action,
  session?: ClientSession,
  usageType?: ServiceUsageType
) => Promise<typeof resource>;

export const chargeServiceUsage: ChargeUsageFunctionType = async (
  resource,
  action,
  session,
  usageType
) => {
  const usage = Object.assign(new ServiceUsage(), {
    _resourceId: resource._id,
    _customerId: resource.serviceCustomerId,
    serviceProviderName: resource.serviceProviderName,
    action,
    type: usageType || resource.usageType,
  } as ServiceUsage);
  const usageInstance = new ServiceUsageModel(usage);
  await usageInstance.save({ session });
  return resource;
};
