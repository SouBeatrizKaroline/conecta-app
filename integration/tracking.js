import { ConectaClient } from './client.js';

const apiUrl = window.CONECTA_API_URL ?? 'http://127.0.0.1:3000';
const client = new ConectaClient(apiUrl, window.sessionStorage);
const page = location.pathname.endsWith('oportunidades.html') ? 'oportunidades' : 'home';
const safeTrack = (type, eventPage, target) =>
  client.session ? client.track(type, eventPage, target).catch(() => undefined) : Promise.resolve();

const segmentProfile = {
  valvulas: 'demo-01',
  offshore: 'demo-03',
  eletrica: 'demo-02',
  hseq: 'demo-06',
  manutencao: 'demo-03',
  logistica: 'demo-04',
  tecnologia: 'demo-05',
};

async function startConsentedJourney() {
  if (client.session) return;
  const selected = document.querySelector('#segmento, #segment')?.value;
  if (selected) window.sessionStorage.setItem('conecta.segment', selected);
  await client.start(segmentProfile[selected] ?? 'demo-01', true);
  await safeTrack('page_view', page, 'page');
}

function preferenceTarget() {
  const selected = window.sessionStorage.getItem('conecta.segment') ?? '';
  if (selected.includes('eletrica')) return 'energia';
  if (selected.includes('hseq')) return 'hseq';
  if (selected.includes('offshore') || selected.includes('manutencao')) return 'manutencao';
  if (selected.includes('logistica')) return 'logistica';
  return 'energia';
}

function classifyClick(element) {
  const text = (element.textContent ?? '').toLocaleLowerCase('pt-BR');
  if (text.includes('ajuda')) return { type: 'click', target: 'ajuda' };
  if (text.includes('concluir cadastro'))
    return { type: 'journey_completed', target: 'concluir' };
  if (text.includes('interesse')) return { type: 'preference', target: preferenceTarget() };
  if (
    text.includes('cadastro') ||
    text.includes('oportunidade') ||
    text.includes('busca') ||
    text.includes('próximo') ||
    text.includes('anterior') ||
    element.matches('#select-abrangencia, #select-local')
  )
    return { type: 'click', target: 'explorar' };
  return null;
}

document.addEventListener('DOMContentLoaded', () => {
  if (client.session) safeTrack('page_view', page, 'page');

  const selectedSegment = document.querySelector('#segmento, #segment');
  selectedSegment?.addEventListener('change', () => {
    if (selectedSegment.value) window.sessionStorage.setItem('conecta.segment', selectedSegment.value);
  });

  const consent = document.querySelector('#lgpd-check');
  consent?.addEventListener('change', () => {
    if (consent.checked) startConsentedJourney().catch(() => undefined);
    else if (client.session) client.revoke().catch(() => undefined);
  });

  document.addEventListener('click', (event) => {
    const element = event.target.closest('button, a');
    if (!element || element.closest('#form-login')) return;
    const classification = classifyClick(element);
    if (classification) safeTrack(classification.type, page, classification.target);
  }, true);

  document.addEventListener('change', (event) => {
    const element = event.target;
    if (!(element instanceof Element)) return;
    const classification = classifyClick(element);
    if (classification) safeTrack(classification.type, page, classification.target);
  });
});
