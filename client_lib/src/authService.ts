import {
  ErrorNotificationEvent,
  SuccessNotificationEvent,
} from '@mucsi96/ui-elements';
import { jwtDecode } from 'jwt-decode';

type Options = {
  namespace: string;
  tokenAgent: string;
  postAuthorizationRedirectUri: string;
  navigateToSignin: () => void;
  scopes: string[];
};

let options: Options | undefined;

export function init(newOptions: Options) {
  if (!newOptions.namespace) {
    throw new Error('Namespace is required');
  }

  if (!newOptions.tokenAgent) {
    throw new Error('Token agent is required');
  }

  if (!newOptions.postAuthorizationRedirectUri) {
    throw new Error('Post authorization redirect URI is required');
  }

  if (!newOptions.navigateToSignin) {
    throw new Error('Navigate to sign-in function is required');
  }

  if (!newOptions.scopes) {
    throw new Error('Scopes are required');
  }

  options = {
    ...newOptions,
    postAuthorizationRedirectUri:
      location.origin + newOptions.postAuthorizationRedirectUri,
  };
}

export function getUserInfo() {
  const tokenClaims = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${options?.namespace}.tokenClaims=`))
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

export function hasRole(role: string) {
  const userInfo = getUserInfo();

  if (!('roles' in userInfo) || !userInfo.roles) {
    return false;
  }

  return userInfo.roles.includes(role);
}

export function assertRole(role: string) {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  try {
    if (!hasRole(role)) {
      throw new Error('Unauthorized');
    }
  } catch (err) {
    options.navigateToSignin();
  }
}

export function signin() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const authorizationUrl = new URL(`${options.tokenAgent}/authorize`);

  authorizationUrl.searchParams.set('namespace', options.namespace);

  authorizationUrl.searchParams.set(
    'postAuthorizationRedirectUri',
    options.postAuthorizationRedirectUri
  );

  authorizationUrl.searchParams.set('scopes', options.scopes.join(' '));

  location.href = authorizationUrl.toString();
}

export async function signout() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const logoutUrl = new URL(`${options.tokenAgent}/logout`);

  logoutUrl.searchParams.set('namespace', options.namespace);

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
    options.navigateToSignin();
  } catch (err) {
    document.dispatchEvent(new ErrorNotificationEvent('Authentication failed'));
  }
}
