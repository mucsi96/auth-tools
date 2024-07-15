export type Options = {
  namespace: string;
  tokenAgent: string;
  postAuthorizationRedirectUri: string;
  navigateToSignin: () => void;
  scopes: string[];
  environment?: 'development' | 'production';
};

export type UserInfo = {
  isSignedIn: boolean;
  userName?: string;
  email?: string;
  initials?: string;
  roles?: string[];
};

export interface AuthService {
  getUserInfo: () => UserInfo;
  hasRole: (role: string) => boolean;
  assertRole: (role: string) => void;
  signin: () => void;
  signout: () => Promise<void>;
}
