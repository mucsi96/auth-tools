import './index.css';
import { assertRole, hasRole, init } from '@mucsi96/auth-tools';
import {
  ErrorNotificationEvent,
  SuccessNotificationEvent,
} from '@mucsi96/ui-elements';

init({
  namespace: 'demo',
  tokenAgent: 'https://auth.auth-tools.home',
  postAuthorizationRedirectUri: '/',
  navigateToSignin: () => {
    history.pushState(null, '', '/login');
    route();
  },
  scopes: [
    `${import.meta.env.VITE_DEMO_API_CLIENT_ID}/read`,
    `${import.meta.env.VITE_DEMO_API_CLIENT_ID}/write`,
  ],
});

type User = {
  id: string;
  name: string;
  email: string;
  authorities: string[];
};

async function fetchUser() {
  try {
    const response = await fetch('/api/user');

    if (!response.ok) {
      throw new Error('Failed to fetch user data.');
    }

    const user: User = await response.json();
    return user;
  } catch (error) {
    document.dispatchEvent(
      new ErrorNotificationEvent('Failed to fetch user data.')
    );
  }
}

async function changeUser() {
  try {
    const response = await fetch('/api/change', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to change user data.');
    }

    document.dispatchEvent(
      new SuccessNotificationEvent('User data changed successfully.')
    );
  } catch (error) {
    document.dispatchEvent(
      new ErrorNotificationEvent('Failed to change user data.')
    );
  }
}

function route() {
  switch (window.location.pathname) {
    case '/login':
      break;
    default:
      assertRole('Reader');
      break;
  }
  render();
}

async function render() {
  const user = hasRole('Reader') && (await fetchUser());
  document.body.innerHTML = `
        <header bt>
          <nav>
            <a href="/" bt-logo>Authtools test</a>
            <ul>
              <li><a href="/" bt-active>Home</a></li>
              ${hasRole('Writer') ? '<li><a href="/admin">Admin</a></li>' : ''}
              <li><a href="https://web.auth-tools.home">About</a></li>
            </ul>
            <section bt-user-info></section>
            <button bt-navbar-toggler popovertarget="navbar-popover"></button>
            <div popover bt id="navbar-popover">
              <ul bt-dropdown-menu>
                <li><a href="/" bt-active>Home</a></li>
                ${
                  hasRole('Writer') ? '<li><a href="/admin">Admin</a></li>' : ''
                }
                <li><a href="https://web.auth-tools.home">About</a></li>
              </ul>
            </div>
          </nav>
        </header>
        <main bt>
          ${
            user
              ? `
                <p>Id: ${user.id}</p>
                <p>Name: ${user.name}</p>
                <p>Email: ${user.email}</p>
                <p>Authorities: ${user.authorities.join(', ')}</p>
                <button bt id="change">Change</button>
              `
              : ''
          }
          <section bt-notifications></section>
        </main>
      `;
  document.getElementById('change')?.addEventListener('click', changeUser);
}

route();