import { MockAuthService } from './mockAuthService';
import { ProdAuthService } from './prodAuthService';
import { AuthService, Options } from './types';

let service: AuthService | undefined;

export function init(options: Options): void {
  service = options.mockUserInfo
    ? new MockAuthService(options)
    : new ProdAuthService(options);
}

export function getUserInfo(): ReturnType<AuthService['getUserInfo']> {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.getUserInfo();
}

export function hasRole(role: string): ReturnType<AuthService['hasRole']> {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.hasRole(role);
}

export function assertRole(
  role: string
): ReturnType<AuthService['assertRole']> {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.assertRole(role);
}

export function signin(): ReturnType<AuthService['signin']> {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  service.signin();
}

export async function signout(): ReturnType<AuthService['signout']> {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  await service.signout();
}
