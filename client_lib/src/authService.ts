import { MockAuthService } from './mockAuthService';
import { ProdAuthService } from './prodAuthService';
import { AuthService, Options } from './types';

let service: AuthService | undefined;

export function init(options: Options) {
  service =
    options.environment === 'development'
      ? new MockAuthService(options)
      : new ProdAuthService(options);
}

export function getUserInfo() {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.getUserInfo();
}

export function hasRole(role: string) {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.hasRole(role);
}

export function assertRole(role: string) {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  return service.assertRole(role);
}

export function signin() {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  service.signin();
}

export async function signout() {
  if (!service) {
    throw new Error('Auth tools not initialized');
  }

  await service.signout();
}
