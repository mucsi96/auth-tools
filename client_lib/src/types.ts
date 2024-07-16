export type Options = {
  namespace: string;
  tokenAgent: string;
  postAuthorizationRedirectUri: string;
  navigateToSignin: () => void;
  scopes: string[];
  mockUserInfo?: UserInfo;
};

export type UserInfo = {
  userName?: string;
  email?: string;
  initials?: string;
  roles?: string[];
};

export interface AuthService {
  getUserInfo: () => UserInfo & { isSignedIn: boolean };
  hasRole: (role: string) => boolean;
  assertRole: (role: string) => void;
  signin: () => void;
  signout: () => Promise<void>;
}
