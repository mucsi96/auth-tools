import { SuccessNotificationEvent } from '@mucsi96/ui-elements';
import { AuthService, Options, UserInfo } from './types';

export class MockAuthService implements AuthService {
  private readonly navigateToSignin: () => void;
  private readonly postAuthorizationRedirectUri: string;

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

    this.postAuthorizationRedirectUri =
      location.origin + options.postAuthorizationRedirectUri;
    this.navigateToSignin = options.navigateToSignin;
  }

  getUserInfo() {
    const userInfo = window.sessionStorage.getItem('mockUserInfo');
    
    if (userInfo) {
      return JSON.parse(userInfo);
    }

    return {
      isSignedIn: false,
    } satisfies UserInfo;
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
    window.sessionStorage.setItem(
      'mockUserInfo',
      JSON.stringify({
        isSignedIn: true,
        userName: 'Robert White',
        email: 'robert.white@mockemail.com',
        initials: 'RW',
        roles: ['Reader', 'Writer'],
      } satisfies UserInfo)
    );
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
