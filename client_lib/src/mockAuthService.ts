import { SuccessNotificationEvent } from '@mucsi96/ui-elements';
import { AuthService, Options, UserInfo } from './types';

export class MockAuthService implements AuthService {
  private readonly navigateToSignin: () => void;
  private readonly postAuthorizationRedirectUri: string;
  private readonly mockUserInfo: UserInfo;

  constructor(options: Options) {
    if (!options.namespace) {
      throw new Error('Namespace is required');
    }

    if (!options.tokenAgent) {
      throw new Error('Token agent is required');
    }

    if (!options.postAuthorizationRedirectUri) {
      throw new Error('Post authorization redirect URI is required');
    }

    if (!options.navigateToSignin) {
      throw new Error('Navigate to sign-in function is required');
    }

    if (!options.scopes) {
      throw new Error('Scopes are required');
    }

    if (!options.mockUserInfo) {
      throw new Error('Mock user info is required');
    }

    this.postAuthorizationRedirectUri =
      location.origin + options.postAuthorizationRedirectUri;
    this.navigateToSignin = options.navigateToSignin;
    this.mockUserInfo = options.mockUserInfo;
  }

  getUserInfo(): UserInfo & { isSignedIn: boolean } {
    const userInfo = window.sessionStorage.getItem('mockUserInfo');

    if (userInfo) {
      return {
        isSignedIn: true,
        ...JSON.parse(userInfo),
      };
    }

    return {
      isSignedIn: false,
    };
  }

  hasRole(role: string) {
    return !!this.getUserInfo().roles?.includes(role);
  }

  assertRole(role: string) {
    try {
      if (!this.hasRole(role)) {
        throw new Error('Unauthorized');
      }
    } catch (err) {
      this.navigateToSignin();
    }
  }

  signin() {
    window.sessionStorage.setItem('mockUserInfo', JSON.stringify(this.mockUserInfo));
    location.href = this.postAuthorizationRedirectUri;
  }

  async signout() {
    window.sessionStorage.removeItem('mockUserInfo');
    document.dispatchEvent(
      new SuccessNotificationEvent('Successfully signed out')
    );
    this.navigateToSignin();
  }
}
