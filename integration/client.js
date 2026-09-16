// Integração isolada: nunca lê formulários, texto livre, CPF, CNPJ ou e-mail.
export class ConectaClient {
  constructor(baseUrl = 'http://127.0.0.1:3000', storage = null) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.session = null;
    this.storage = storage;
    this.restore();
  }
  restore() {
    if (!this.storage) return null;
    try {
      const saved = JSON.parse(this.storage.getItem('conecta.session'));
      if (saved?.id && saved?.token) this.session = saved;
    } catch {
      this.storage.removeItem('conecta.session');
    }
    return this.session;
  }
  save() {
    if (!this.storage) return;
    if (this.session) this.storage.setItem('conecta.session', JSON.stringify(this.session));
    else this.storage.removeItem('conecta.session');
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
    this.save();
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
    this.save();
    return result;
  }
}
