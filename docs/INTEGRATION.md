# Executar os três sistemas

As telas `index.html`, `home.html` e `oportunidades.html` carregam `integration/tracking.js`. `index.html` é a entrada pública do GitHub Pages e tem o mesmo conteúdo da Home. Após o aceite explícito na etapa LGPD, o navegador cria uma sessão fictícia na API, registra páginas e categorias controladas de interação e preserva o token somente no `sessionStorage` para acompanhar a navegação. Nenhum valor de formulário, busca ou identificação é lido pelo rastreador.

## Requisitos

Git, Node.js 24.x e npm. Banco SQLite embutido no Node: não é necessário instalar MariaDB para esta versão. Alguns Node 24 emitem aviso de API experimental para node:sqlite; mantenha a versão documentada. Os frontends novos não exigem build ou CDN; as telas herdadas dependem de CDNs externos para Tailwind/Lucide/fontes.

```sh
git clone https://github.com/SouBeatrizKaroline/conecta-app.git
git clone https://github.com/SouBeatrizKaroline/conecta-api.git
git clone https://github.com/SouBeatrizKaroline/conecta-analytics.git
```

### Terminal 1: API

```sh
cd conecta-api
npm ci
npm run setup
npm run seed
npm test
npm start
```

setup cria .env com token aleatório e escrita local, sem sobrescrever arquivo existente. Abra o .env local para copiar ADMIN_TOKEN ao painel. O token não é exibido em logs nem enviado ao GitHub. seed insere 37 eventos de seis empresas fictícias apenas quando a base não tem eventos. A idade dos eventos é relativa ao dia de execução, para demonstrar sinais.

### Terminal 2: frontend do usuário

```sh
cd conecta-app
npm ci
npm start
```

Abra http://127.0.0.1:8080/index.html. Marque o aceite LGPD demonstrativo, conclua o cadastro e explore oportunidades. `index.html`, `home.html` e `oportunidades.html` carregam `integration/tracking.js`, sem ler campos de formulário, CNPJ, e-mail ou busca. Para teste técnico isolado, use também http://127.0.0.1:8080/demo.html.

### Terminal 3: Analytics

```sh
cd conecta-analytics
npm ci
npm start
```

Abra http://127.0.0.1:8081, informe a API e `ADMIN_TOKEN` ou `DEMO_ADMIN_EMAIL`/`DEMO_ADMIN_PASSWORD` e conecte. Atualize após interagir com a jornada. Abra um perfil para ver a sequência, altere um sinal para “Planejada”, crie um rascunho de campanha e exporte CSV.

## Roteiro demonstrável de ponta a ponta

1. Com a base inicial: 37 eventos, 6 perfis, 9 sessões, 3 perfis com retorno e 1 com conclusão.
2. Na página demonstrativa, inicie uma sessão: um page_view é registrado.
3. Clique duas vezes em ajuda ou oportunidades e atualize o Analytics.
4. Observe a nova sessão, o primeiro clique e a timeline do perfil.
5. Revise a recomendação e registre o estado da ação. Consulte a auditoria no painel.
6. Exporte CSV com o mesmo período/segmento; os dados vêm da API.
7. Volte à jornada e desative a coleta. Atualize o painel: os eventos daquela sessão foram removidos; a carga inicial continua disponível.

## Modo de leitura para apresentação pública

No backend, use DEMO_READ_ONLY=true com uma base exclusivamente fictícia. GET administrativos passam a dispensar token e todas as gravações ficam bloqueadas. A API deve estar atrás de HTTPS; configure HOST/PORT e ALLOWED_ORIGINS no provedor. Não inclua .env, banco ou tokens em hospedagem estática. A publicação de aplicação/hospedagem é uma etapa separada da publicação dos repositórios.

API publicada atual: https://conecta-api-2x27.onrender.com. No Render, os outbound IPs compartilhados informados são `74.220.50.0/24` e `74.220.58.0/24`; eles não são exclusivos.

## Problemas comuns

| Sintoma                                 | Verificação                                                                                     |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Dados indisponíveis / Failed to fetch   | API iniciada? Endereço correto? Origem e porta incluídas em ALLOWED_ORIGINS?                    |
| 401 no Analytics                        | Use o ADMIN_TOKEN do .env da API em execução; não o token de sessão                             |
| 403 ao iniciar jornada                  | DEMO_READ_ONLY deve ser false na demonstração local de escrita                                  |
| Cadastro não aparece no painel          | O painel mostra eventos categóricos; dados digitados em formulário não são enviados à API        |
| Nenhum evento no painel                 | Execute seed numa base vazia, ajuste filtros ou registre a jornada demonstrativa                |
| Contagens não mudam                     | Clique em Atualizar análise; o painel não faz atualização em tempo real                         |
| Porta ocupada                           | Defina PORT e atualize as origens/endereços correspondentes                                     |
