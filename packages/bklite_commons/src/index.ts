import { setGlobalOptions, Severity } from "@typegoose/typegoose";
setGlobalOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
  schemaOptions: {
    timestamps: true,
  },
});
import {
  ProductAutomator,
  ProductAutomatorModel,
  ProductTemplate,
  COLLECTION_PRODUCT_AUTOMATOR,
} from "./models/_abstract/ProductAutomator/ProductAutomator.model";

export {
  ProductAutomator,
  ProductAutomatorModel,
  ProductTemplate as ProductParam,
  COLLECTION_PRODUCT_AUTOMATOR,
};

import {
  Product,
  ProductModel,
  COLLECTION_PRODUCT,
} from "./models/_abstract/Product/Product.model";

export { Product, ProductModel, COLLECTION_PRODUCT };

import {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel,
} from "./models/Booking/Product.model";

import {
  ITemplateGenerateParams,
  ProductAutomatorBooking,
  ProductAutomatorBookingModel,
  ProductBookingTemplate,
} from "./models/Booking/ProductAutomator.model";

export {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel,
  ITemplateGenerateParams,
  ProductAutomatorBooking,
  ProductAutomatorBookingModel,
  ProductBookingTemplate,
};
