export interface CategoryModel {
  status: number;
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageId: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  filePath: string;
}

export interface ProductsModel {
  _id: string;
  status: string;
  title: string;
  description: string;
  imageUrl: string;
  imageId: string;
  type: string;
  variant: Array<VariantModel>;
  user: string;
  createdAt: string;
  updatedAt: string;
  category: CategoryModel;
  isCategoryBasedOffer: any;
  offerInfo?: OfferModel;
  averageRating: number;
  noOfUsersRated: number;
  totalRating: number;
  dealPercent?: number;
  isDealAvailable?: boolean;
  isAddedToCart?: boolean;
  cartId?: string;
  quantityToCart?: number;
  filePath?: string;
  discountAmount?: number;
  isFavourite: boolean;
  isRated: boolean;
  categoryId: string;
  unitInCart?: string;
  productImages: Array<ProductImageModel>;
}

export interface ProductImageModel {
  filePath: string;
  imageUrl: string;
  imageId: string;
}

export interface VariantModel {
  _id: string;
  unit: string;
  price: string;
  quantity?: number;
  enable: boolean;
  productStock: number;
  discountAmount?: number;
}

export interface DealsModel {
  status: number;
  _id: string;
  title: string;
  description: string;
  dealPercent: number,
  dealType: string,
  productId: string | ProductsModel;
  categoryId: string | CategoryModel;
  imageUrl: string;
  imageId: string;
  createdAt: Date;
  updatedAt: Date;
  filePath: string;
}

export interface OfferModel {
  products: Array<string>;
  status: number;
  _id: string;
  description: string;
  couponCode: string;
  offerPercentage: number;
  startDate: number;
  expiryDate: number
  couponType: string;
  category: string;
  offerAppliedTo: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface FavouritesModel {
  isDealAvailable: boolean;
  averageRating: number;
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  variant: Array<VariantModel>
  filePath: string;
  sku: string;
  dealPercent: number;
  isAddedToCart
}

export interface SubCategoryModel {
  _id: string;
  title: string;
}

export interface BannerModel {
  _id: string;
  title: string;
  bannerType: string;
  categoryId: string;
  productId: string;
  imageURL: string;
  description: string;
  filePath: string;
}

export interface LanguagesModel {
  languageCode: string;
  languageName: string;
  status: number;
  isDefault: number;
  webJson: string;
  deliveyAppJson: string;
  mobAppJson: string;
  cmsJson: string;
  backendJson: string;
  _id?: string;
}

export enum DealTypeEnum {
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT'
}
