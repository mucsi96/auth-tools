import { onElementConnected } from '@mucsi96/ui-elements';
import { getUserInfo, signin, signout } from './authService';

onElementConnected('[bt-user-info]', (element) => {
  getUserInfo().then((userInfo) => {
    if (userInfo.isSignedIn && 'userName' in userInfo) {
      element.innerHTML = `<button bt-avatar id="avatar" popovertarget="avatar-popover">
      JD
    </button>
    <div popover bt id="avatar-popover">
      <ul bt-dropdown-menu>
        <li bt-separated>
          <p>John Doe</p>
          <p>john.doe@authelia.com</p>
        </li>
        <li><button type="button">Sign out</button></li>
      </ul>
    </div>`;
      element
        .querySelector('button')
        ?.addEventListener('click', () => signout());
    } else {
      element.innerHTML = `<button bt>Sign in</button>`;
      element
        .querySelector('button')
        ?.addEventListener('click', () => signin());
    }
  });
});
