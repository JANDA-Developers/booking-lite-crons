import { setGlobalOptions, Severity } from '@typegoose/typegoose'
import {
  ProductAutomator,
  ProductAutomatorModel,
  ProductTemplate,
  COLLECTION_PRODUCT_AUTOMATOR
} from './models/_abstract/ProductAutomator/ProductAutomator.model'

import {
  Product,
  ProductModel,
  COLLECTION_PRODUCT
} from './models/_abstract/Product/Product.model'

import {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel
} from './models/Booking/Product.model'

import {
  ITemplateGenerateParams,
  ProductAutomatorBooking,
  ProductAutomatorBookingModel,
  ProductBookingTemplate
} from './models/Booking/ProductAutomator.model'
setGlobalOptions({
  options: {
    allowMixed: Severity.ALLOW
  },
  schemaOptions: {
    timestamps: true
  }
})

export {
  ProductAutomator,
  ProductAutomatorModel,
  ProductTemplate as ProductParam,
  COLLECTION_PRODUCT_AUTOMATOR
}

export { Product, ProductModel, COLLECTION_PRODUCT }

export * from './models/Purchase/NicepayRefundResult.type'
export * from './models/Purchase/PurchaseBundle.model'
export * from './models/Purchase/Purchase.model'
export * from './models/Settlement/Settlement.model'
export * from './models/Settlement/SettlementMall.model'

export {
  ProductBooking,
  ProductBookingAutomatorInfo,
  ProductBookingModel,
  ITemplateGenerateParams,
  ProductAutomatorBooking,
  ProductAutomatorBookingModel,
  ProductBookingTemplate
}
