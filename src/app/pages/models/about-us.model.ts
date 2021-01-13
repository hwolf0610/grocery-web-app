export interface BusinessInfoModel {
  email: string,
  description: string,
  address: string,
  facebookUrl: string,
  googleUrl: string,
  linkedInUrl: string,
  twitterUrl: string,
  instagramUrl: string,
  officeLocation: string,
  phoneNumber: string,
  aboutUs: string,
  storeName: string,
  dasboardLogo: {
    imageUrl: string,
    imageId: string
  },
  userApp: {
    imageUrl: string,
    imageId: string
  },
  webApp: {
    imageUrl: string,
    imageId: string
  },
  deliveryAppLogo: {
    imageUrl: string,
    imageId: string
  }
}

export interface TermsandConditionsModel {
  termsAndConditions: string
}

export interface PrivacyModel {
  privacyPolicy: string
}
