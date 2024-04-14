import { customElement, htmlToString } from '@mucsi96/ui-elements';
import { html } from 'lit';
import { getUserInfo, signout } from './authService';

@customElement({
  name: 'bt-user-info',
  extends: 'section',
})
export class UserInfo extends HTMLElement {
  constructor() {
    super();

    getUserInfo().then(({ userName }) => {
      this.innerHTML = htmlToString(html`<h1 app-heading>Hello ${userName}!</h1>
        <button app-button color="red" (click)=${() => signout()} type="button">
          Sign out
        </button>`);
    });
  }
}
