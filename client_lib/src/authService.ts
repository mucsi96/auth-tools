import { ErrorNotificationEvent } from '@mucsi96/ui-elements';
import { jwtDecode } from 'jwt-decode';

type Options = {
  tokenAgent: string;
  postAuthorizationRedirectUri: string;
  navigateToSignin: () => void;
};

let options: Options | undefined;

export function init(newOptions: Options) {
  options = {
    ...newOptions,
    postAuthorizationRedirectUri:
      location.origin + newOptions.postAuthorizationRedirectUri,
  };
}

export function getUserInfo() {
  const idToken = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('idToken='))
    ?.split('=')[1];

  try {
    if (!idToken) {
      return { isSignedIn: false };
    }

    const { name, email } = jwtDecode<{ name: string; email: string }>(idToken);

    return {
      isSignedIn: true,
      userName: name,
      email,
      initials: name
        .split(' ')
        .map((n) => n[0])
        .join(''),
      roles: ['admin'],
    };
  } catch (err) {
    return { isSignedIn: false };
  }
}

export async function hasRole(role: string) {
  const userInfo = getUserInfo();

  if (!('roles' in userInfo) || !userInfo.roles) {
    return false;
  }

  return userInfo.roles.includes(role);
}

export async function assertRole(role: string) {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  try {
    if (!(await hasRole(role))) {
      throw new Error('Unauthorized');
    }
  } catch (err) {
    options.navigateToSignin();
  }
}

export async function signin() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const authorizationUrl = new URL(`${options.tokenAgent}/authorize`);

  authorizationUrl.searchParams.set(
    'postAuthorizationRedirectUri',
    options.postAuthorizationRedirectUri
  );

  location.href = authorizationUrl.toString();
}

export async function signout() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  try {
    const res = await fetch(`${options.tokenAgent}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to sign out');
    }

    options.navigateToSignin();
  } catch (err) {
    document.dispatchEvent(new ErrorNotificationEvent('Authentication failed'));
  }
}
