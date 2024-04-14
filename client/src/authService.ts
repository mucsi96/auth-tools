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
  options = newOptions;
  userInfo = undefined;
}

export async function getUserInfo() {
  if (userInfo) {
    return userInfo;
  }

  const res = await fetch('/auth/user-info');

  if (!res.ok) {
    throw new Error('Failed to get user info');
  }

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
}

export async function hasRole(role: string) {
  const { roles } = await getUserInfo();
  return roles.includes(role);
}

export async function assertRole(role: string) {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  if (!(await hasRole(role))) {
    options.navigateToSignin();
  }
}

export async function signin() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const res = await fetch('/auth/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ redirectUri: options.redirectUri }),
  });

  if (!res.ok) {
    throw new Error('Failed to sign in');
  }

  const { authorizationUrl } = await res.json();

  location.href = authorizationUrl;
}

export async function handleSigninRedirectCallback() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const res = await fetch('/auth/get-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      callbackUrl: location.href.toString(),
      redirectUri: options.redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to handle signin redirect callback');
  }

  await res.json();

  options.navigateHome();
}

export async function signout() {
  if (!options) {
    throw new Error('Auth tools not initialized');
  }

  const res = await fetch('/auth/logout', {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to sign out');
  }

  options.navigateToSignin();
}
