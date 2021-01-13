export interface LoginModel {
  mobileNumber: string;
  password: string;
}

export interface RegistrationModel {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  mobileNumber: string;
  countryCode: string;
  countryName: string;
}

export interface OTPModel {
  otp: string;
  mobileNumber: string;
  sId: string;
}

export interface UserInfoModel {
  location: {
    type: string;
    coordinates: Array<number>;
  };
  _id: string;
  deliveryAreaCode: Array<string>;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  freeDeliveryDistance: number;
  deliveryCharge: number;
  deliveryDistanceUnit: string;
  registrationDate: number;
  emailVerified: boolean;
  verificationId: string;
  deliverytimingslot: Array<any>;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  filePath: string;
  language?: string;
}
export interface walletModel {
  walletAmount: number;
}

export interface walletHistoryModel {
  orderID: string;
  updatedAt: string;
  transactionType: string;
  amount: number;
  isCredited: boolean;
}