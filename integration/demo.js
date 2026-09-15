import { ConectaClient } from './client.js';
const client = new ConectaClient();
const status = document.querySelector('#status');
const controls = document.querySelector('#journey');
async function run(action) {
  try {
    status.textContent = 'Conectando…';
    await action();
  } catch (error) {
    status.textContent = `Não concluído: ${error.message}`;
  }
}
document.querySelector('#start').addEventListener('submit', (event) => {
  event.preventDefault();
  run(async () => {
    client.baseUrl = document.querySelector('#api').value.replace(/\/$/, '');
    await client.start(
      document.querySelector('#profile').value,
      document.querySelector('#consent').checked,
    );
    controls.disabled = false;
    document.querySelector('#start-session').disabled = true;
    await client.track('page_view', 'home', 'page');
    status.textContent =
      'Sessão iniciada. Acesso registrado na API. Você pode explorar sua jornada.';
  });
});
for (const button of document.querySelectorAll('[data-event]'))
  button.addEventListener('click', () =>
    run(async () => {
      await client.track(button.dataset.event, button.dataset.page, button.dataset.target);
      const context = await client.context();
      status.textContent = `Evento registrado: ${button.textContent}. ${context.nextStep}`;
    }),
  );
document.querySelector('#revoke').addEventListener('click', () =>
  run(async () => {
    await client.revoke();
    controls.disabled = true;
    document.querySelector('#start-session').disabled = false;
    document.querySelector('#consent').checked = false;
    status.textContent = 'Coleta desativada. Os eventos desta sessão foram removidos da API.';
  }),
);
