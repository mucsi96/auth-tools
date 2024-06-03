import { onElementConnected } from '@mucsi96/ui-elements';
import { getUserInfo, signin, signout } from './authService';

onElementConnected('[bt-user-info]', (element) => {
  const userInfo = getUserInfo();

  if (userInfo.isSignedIn && 'userName' in userInfo) {
    const { userName, email, initials } = userInfo;
    element.innerHTML = `<button bt-avatar id="avatar" popovertarget="avatar-popover">
    ${initials}
  </button>
  <div popover bt id="avatar-popover">
    <ul bt-dropdown-menu>
      <li bt-separated>
        <p>${userName}</p>
        <p>${email}</p>
      </li>
      <li><button type="button" id="sign-out">Sign out</button></li>
    </ul>
  </div>`;
    element
      .querySelector('#sign-out')
      ?.addEventListener('click', () => signout());
  } else {
    element.innerHTML = `<button bt>Sign in</button>`;
    element.querySelector('button')?.addEventListener('click', () => signin());
  }
});
