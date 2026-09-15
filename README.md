# Conecta App

### A experiência do usuário, em desenvolvimento

**Conecta transforma acessos em jornadas e jornadas em próximos passos relevantes.**

Frontend principal da Equipe 05 para o Hackathon Conexão Ancestral. Este repositório preserva o código do frontend informado pela equipe e acrescenta documentação profissional e uma integração demonstrativa isolada.

> **Estado atual:** home.html, index.html, oportunidades.html, script.js e styles.css foram preservados byte a byte na revisão de origem. A integração funcional com a nova API está em **demo.html + integration/**. As telas originais ainda não enviam eventos ao backend novo. O login e a conclusão do cadastro originais são simulações de interface, não autenticação real.

**Explore:** [Arquitetura](docs/ARCHITECTURE.md) · [Contrato da API](docs/API.md) · [Dados e métricas](docs/DATA-MODEL.md) · [Execução integrada](docs/INTEGRATION.md) · [Produto e identidade](docs/PRODUCT.md) · [Roadmap](docs/ROADMAP.md) · [Contribuição](CONTRIBUTING.md) · [Segurança](SECURITY.md) · [Verificação](docs/VERIFICATION.md)

## Abrir e testar

Com Node.js 24: execute npm ci e npm start. Abra **http://127.0.0.1:8080/demo.html** para a jornada integrada ou **http://127.0.0.1:8080/home.html** para o frontend original. Para registrar eventos, inicie primeiro a API em modo local, conforme o [guia dos três sistemas](docs/INTEGRATION.md).

Não existe URL de aplicação hospedada nesta entrega; links locais exigem os serviços em execução. GitHub contém os repositórios públicos.

## O desafio e a nossa resposta

O **Hackathon Conexão Ancestral**, da **Petronect**, com execução da **KODIE Academy**, propõe identificar os acessos ao Portal Petronect e usar esse conhecimento para apoiar o reengajamento de usuários. O material de abertura descreve uma lacuna entre contar cliques e compreender quem acessa, qual é o primeiro clique e com que frequência retorna.

O **Conecta** organiza esse problema em um ciclo demonstrável: **acesso → evento → jornada → sinal → próxima ação**. A proposta atende fornecedores e clientes na experiência de navegação e apoia Marketing e Atendimento na interpretação dos acessos.

**Todos os dados da nova API e do Analytics são fictícios. Não existe integração com o Portal Petronect.** As recomendações são regras transparentes para revisão humana, sem modelos preditivos, envio de campanhas ou promessa de aumento de conversão.

Fonte do escopo: material enviado pela equipe, _Slides_Abertura_Hackathon_Conexao_Ancestral.pdf_, páginas 2, 8, 9, 11 e 12, abertura de 14/09/2026. As páginas 8 e 9 sustentam o problema e o uso obrigatório de base simulada/protótipo demonstrável. O PDF original não é redistribuído aqui.

## Os três repositórios

| Repositório                                                                  | Responsabilidade                                                  | Execução local                  |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------- |
| [conecta-app](https://github.com/SouBeatrizKaroline/conecta-app)             | Frontend do usuário preservado e integração demonstrativa isolada | http://127.0.0.1:8080/demo.html |
| [conecta-api](https://github.com/SouBeatrizKaroline/conecta-api)             | Coleta, armazenamento, processamento, API e exportação            | http://127.0.0.1:3000/health    |
| [conecta-analytics](https://github.com/SouBeatrizKaroline/conecta-analytics) | Visão gerencial, jornadas, sinais e gestão de ações               | http://127.0.0.1:8081           |

```mermaid
flowchart LR
  U[Usuário demonstrativo] --> F[Conecta App]
  F -->|Sessão e eventos autorizados| API[Conecta API v1]
  API -->|Contexto mínimo da própria sessão| F
  API --> DB[(SQLite: eventos e ações)]
  DB --> R[Regras de jornada na API]
  R --> API
  A[Conecta Analytics] -->|Consulta agregados e jornadas| API
  API -->|Dados processados e CSV| A
  G[Marketing e Atendimento] --> A
  A -->|Atualiza estado de uma ação| API
```

O Analytics consulta a API por HTTP e atualiza sob demanda. Não há conexão direta dos frontends ao banco, WebSocket ou envio automático do backend ao painel.

## O que este frontend faz

| Área                                                     | Situação                                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Landing page, formulário, representantes e oportunidades | Herdados, ainda em desenvolvimento                                                    |
| Consulta de CNPJ na tela original                        | Usa BrasilAPI externa; não é integração Petronect                                     |
| Login e conclusão visual                                 | Estado local no navegador; não valida identidade no servidor                          |
| Jornada demonstrativa                                    | Cria sessão fictícia, registra acesso/cliques/interesse/conclusão e consulta contexto |
| Desativar coleta                                         | Remove eventos da sessão demonstrativa na API                                         |
| Instrumentação das telas principais                      | Planejada após estabilização, não ativada                                             |

## Estrutura

```text
├── home.html / index.html / oportunidades.html  # Telas originais
├── script.js / styles.css                       # Código original
├── demo.html                                    # Fluxo integrado separado
├── integration/
│   ├── client.js                                # Cliente de sessão e eventos
│   ├── demo.js                                  # Interações explícitas da demo
│   └── demo.css                                 # Estilo exclusivo da demo
├── scripts/serve.js                             # Servidor local, arquivos permitidos
├── docs/                                        # Arquitetura, contrato e produto
└── .github/                                     # CI e modelo de PR
```

## Tecnologias e integração

HTML organiza as páginas; CSS3/Tailwind compõem o visual herdado; **JavaScript** implementa o comportamento. O cliente novo usa módulos ES e fetch, sem framework adicional. Tokens de sessão ficam apenas em memória. Os campos de formulário, CPF, CNPJ, e-mail e texto livre nunca são lidos pelo cliente de eventos.

Para futura instrumentação, importe ConectaClient de integration/client.js, crie uma sessão após adesão explícita e chame track com os valores do catálogo. Não inclua scripts de coleta em todas as páginas antes de revisar o desenho da jornada. O primeiro repositório continua sendo a frente em desenvolvimento da equipe.

## Equipe 05

| Integrante                         |
| ---------------------------------- |
| Ines Correa Gomes Cardinot         |
| Beatriz Karoline Cordeiro da Silva |
| Kesly Aquinoã Ferreira da Silva    |
| Milene Arnaldo Ribeiro Belotto     |
| Ana Carolina Pereira Ruas          |

Os papéis individuais devem ser definidos pela equipe. Esta documentação não atribui funções ou resultados de seleção não confirmados.

## Desenvolvimento e licença

Leia [CONTRIBUTING](CONTRIBUTING.md) para branches, Conventional Commits, revisão e padrões. Veja [roadmap](docs/ROADMAP.md), [segurança](SECURITY.md) e [origem da implementação](docs/PROVENANCE.md). A licença MIT está **sugerida para decisão da equipe**, conforme [LICENSE](LICENSE); não foi aplicada retroativamente ao código herdado.
