// Integração isolada: nunca lê formulários, texto livre, CPF, CNPJ ou e-mail.
export class ConectaClient {
  constructor(baseUrl = 'http://127.0.0.1:3000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.session = null;
  }
  async request(path, { method = 'GET', body } = {}) {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(this.session ? { Authorization: `Bearer ${this.session.token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message ?? 'Não foi possível acessar a API.');
    return data;
  }
  async start(profileId, analyticsConsent) {
    this.session = await this.request('/sessions', {
      method: 'POST',
      body: { profileId, analyticsConsent },
    });
    return this.session;
  }
  async track(type, page, target) {
    if (!this.session) throw new Error('Inicie uma sessão demonstrativa primeiro.');
    const event = {
      id: crypto.randomUUID(),
      type,
      page,
      target,
      occurredAt: new Date().toISOString(),
    };
    // Mesmo id em uma eventual repetição manual evita contagem duplicada na API.
    return this.request(`/sessions/${this.session.id}/events`, { method: 'POST', body: event });
  }
  context() {
    return this.request(`/sessions/${this.session.id}/context`);
  }
  async revoke() {
    const result = await this.request(`/sessions/${this.session.id}/preferences`, {
      method: 'PATCH',
      body: { analyticsConsent: false },
    });
    this.session = null;
    return result;
  }
}
