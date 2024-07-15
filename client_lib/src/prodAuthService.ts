import {
  ErrorNotificationEvent,
  SuccessNotificationEvent,
} from '@mucsi96/ui-elements';
import { jwtDecode } from 'jwt-decode';
import { AuthService, Options } from './types';

export class ProdAuthService implements AuthService {
  private readonly namespace: string;
  private readonly tokenAgent: string;
  private readonly postAuthorizationRedirectUri: string;
  private readonly navigateToSignin: () => void;
  private readonly scopes: string[];

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

    this.namespace = options.namespace;
    this.tokenAgent = options.tokenAgent;
    this.postAuthorizationRedirectUri =
      location.origin + options.postAuthorizationRedirectUri;
    this.navigateToSignin = options.navigateToSignin;
    this.scopes = options.scopes;
  }

  getUserInfo() {
    const tokenClaims = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith(`${this.namespace}.tokenClaims=`))
      ?.split('=')[1];

    try {
      if (!tokenClaims) {
        return { isSignedIn: false };
      }

      const { name, email, roles, preferred_username } = jwtDecode<{
        name: string;
        email: string;
        roles: string[];
        preferred_username: string;
      }>(`.${tokenClaims}`);

      return {
        isSignedIn: true,
        userName: name,
        email: email ?? preferred_username,
        initials: name
          .split(' ')
          .map((n) => n[0])
          .join(''),
        roles,
      };
    } catch (err) {
      return { isSignedIn: false };
    }
  }

  hasRole(role: string) {
    const userInfo = this.getUserInfo();

    if (!('roles' in userInfo) || !userInfo.roles) {
      return false;
    }

    return userInfo.roles.includes(role);
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
    const authorizationUrl = new URL(`${this.tokenAgent}/authorize`);

    authorizationUrl.searchParams.set('namespace', this.namespace);

    authorizationUrl.searchParams.set(
      'postAuthorizationRedirectUri',
      this.postAuthorizationRedirectUri
    );

    authorizationUrl.searchParams.set('scopes', this.scopes.join(' '));

    location.href = authorizationUrl.toString();
  }

  async signout() {
    const logoutUrl = new URL(`${this.tokenAgent}/logout`);

    logoutUrl.searchParams.set('namespace', this.namespace);

    try {
      const res = await fetch(logoutUrl.toString(), {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to sign out');
      }

      document.dispatchEvent(
        new SuccessNotificationEvent('Successfully signed out')
      );
      this.navigateToSignin();
    } catch (err) {
      document.dispatchEvent(
        new ErrorNotificationEvent('Authentication failed')
      );
    }
  }
}
