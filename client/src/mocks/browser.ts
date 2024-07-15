import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

const mocks = [
  http.get('/api/user', () =>
    HttpResponse.json({
      id: 'rob',
      name: 'Robert White',
      email: 'robert.white@mockemail.com',
      authorities: ['Reader'],
    })
  ),
  http.post('/api/change', () => HttpResponse.json({})),
];

export async function startWorker() {
  const worker = setupWorker(...mocks);
  await worker.start({ onUnhandledRequest: 'error' });
}
