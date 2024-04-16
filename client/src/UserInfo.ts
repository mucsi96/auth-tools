import { customElement, htmlToString } from '@mucsi96/ui-elements';
import { html } from 'lit';
import { getUserInfo, signin, signout } from './authService';

@customElement({
  name: 'bt-user-info',
  extends: 'section',
})
export class UserInfo extends HTMLElement {
  constructor() {
    super();

    getUserInfo().then((userInfo) => {
      if ('userName' in userInfo) {
        this.innerHTML = htmlToString(html`<h1 app-heading>
            Hello ${userInfo.userName}!
          </h1>
          <button is="bt-button" color="red" type="button">Sign out</button>`);
        this.querySelector('button')?.addEventListener('click', () =>
          signout()
        );
      }

      this.innerHTML = htmlToString(html`<button
        is="bt-button"
        color="blue"
        type="button"
      >
        Sign in
      </button>`);
      this.querySelector('button')?.addEventListener('click', () => signin());
      return;
    });
  }
}
