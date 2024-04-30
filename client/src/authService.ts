import { ErrorNotificationEvent } from '@mucsi96/ui-elements';

type Options = {
  redirectUri: string;
  navigateHome: () => void;
  navigateToSignin: () => void;
};

let options: Options | undefined;
let userInfo:
  | { isSignedIn: boolean; userName: string; roles: string[] }
  | undefined;

export function init(newOptions: Options) {
  options = {
    ...newOptions,
    redirectUri: location.origin + newOptions.redirectUri,
  };
  userInfo = undefined;
}

export async function getUserInfo() {
  if (userInfo) {
    return userInfo;
  }

  const res = await fetch('/auth/user-info');

  if (!res.ok) {
    return { isSignedIn: false };
  }
  try {
    const responseBody = (await res.json()) as {
      sub: string;
      name: string;
      groups: string[];
    };

    userInfo = {
      isSignedIn: !!responseBody.sub,
      userName: responseBody.name,
      roles: responseBody.groups ?? [],
    };

    return userInfo;
  } catch (err) {
    return { isSignedIn: false };
  }
}

export async function hasRole(role: string) {
  const userInfo = await getUserInfo();

  if (!('roles' in userInfo)) {
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

  try {
    const res = await fetch('/auth/authorize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectUri: options.redirectUri,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to sign in');
    }

    const { authorizationUrl } = await res.json();

    location.href = authorizationUrl;
  } catch (err) {
    document.dispatchEvent(new ErrorNotificationEvent('Authentication failed'));
  }
}

export async function handleSigninRedirectCallback() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  try {
    const res = await fetch('/auth/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callbackUrl: decodeURI(location.href),
        redirectUri: options.redirectUri,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to handle signin redirect callback');
    }

    options.navigateHome();
  } catch (err) {
    document.dispatchEvent(new ErrorNotificationEvent('Authentication failed'));
  }
}

export async function signout() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  try {
    const res = await fetch('/auth/logout', {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Failed to sign out');
    }

    options.navigateToSignin();
  } catch (err) {
    document.dispatchEvent(new ErrorNotificationEvent('Authentication failed'));
  }
}
