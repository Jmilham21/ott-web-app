import type { AccessModel, Config } from '../../../types/config';
import type {
  AuthData,
  ChangePassword,
  ChangePasswordWithOldPassword,
  Customer,
  CustomerConsent,
  DeleteAccount,
  ExportAccountData,
  GetCaptureStatus,
  GetCustomerConsents,
  GetPublisherConsents,
  Login,
  NotificationsData,
  Register,
  ResetPassword,
  GetSocialURLs,
  UpdateCaptureAnswers,
  UpdateCustomer,
  UpdateCustomerConsents,
  UpdatePersonalShelves,
} from '../../../types/account';

export type AccountServiceFeatures = {
  readonly canUpdateEmail: boolean;
  readonly canSupportEmptyFullName: boolean;
  readonly canChangePasswordWithOldPassword: boolean;
  readonly canRenewSubscription: boolean;
  readonly canExportAccountData: boolean;
  readonly canDeleteAccount: boolean;
  readonly canUpdatePaymentMethod: boolean;
  readonly canShowReceipts: boolean;
  readonly hasSocialURLs: boolean;
  readonly hasNotifications: boolean;
};

export default abstract class AccountService {
  readonly features: AccountServiceFeatures;

  abstract accessModel: AccessModel;
  abstract svodOfferIds: string[];
  abstract sandbox: boolean;

  protected constructor(features: AccountServiceFeatures) {
    this.features = features;
  }

  abstract initialize: (config: Config, url: string, logoutCallback: () => Promise<void>) => Promise<void>;

  abstract getAuthData: () => Promise<AuthData | null>;

  abstract login: Login;

  abstract register: Register;

  abstract logout: () => Promise<void>;

  abstract getUser: ({ config }: { config: Config }) => Promise<{ user: Customer; customerConsents: CustomerConsent[] }>;

  abstract getPublisherConsents: GetPublisherConsents;

  abstract getCustomerConsents: GetCustomerConsents;

  abstract updateCustomerConsents: UpdateCustomerConsents;

  abstract getCaptureStatus: GetCaptureStatus;

  abstract updateCaptureAnswers: UpdateCaptureAnswers;

  abstract resetPassword: ResetPassword;

  abstract changePasswordWithResetToken: ChangePassword;

  abstract changePasswordWithOldPassword: ChangePasswordWithOldPassword;

  abstract updateCustomer: UpdateCustomer;

  abstract updatePersonalShelves: UpdatePersonalShelves;

  abstract subscribeToNotifications: NotificationsData;

  abstract getSocialUrls?: GetSocialURLs;

  abstract exportAccountData?: ExportAccountData;

  abstract deleteAccount?: DeleteAccount;
}
