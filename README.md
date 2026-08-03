# Mobile2Screen Frontend Web

Aplicação frontend do sistema de gerenciamento e envio de alertas para dispositivos (TVs e Raspberry Pi), com dashboard, histórico, gerenciamento de dispositivos e autenticação integrada ao backend Laravel.

## Tecnologias

* React 19 + TypeScript
* Vite 6
* React Router 7
* Tailwind CSS 4 + Radix UI
* Axios
* Recharts

## Requisitos

* Node.js 18+
* npm 9+
* Backend Laravel rodando (padrão `http://localhost:8000`)

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie em desenvolvimento:

```bash
npm run dev
```

3. Gere o build de produção:

```bash
npm run build
```

## Configuração de ambiente

O cliente HTTP usa, por padrão, `http://localhost:8000`.

Para alterar, crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Rotas principais

* Pública:

  * `/` — login/registro
* Protegidas (requer usuário autenticado):

  * `/app` — dashboard
  * `/app/dispositivos`
  * `/app/enviar`
  * `/app/historico`
  * `/app/mapa`
  * `/app/configuracoes`
* Administrativas:

  * `/admin`
  * `/admin/usuarios`

## Autenticação e sessão

* Fluxo Laravel Sanctum:

  * `GET /sanctum/csrf-cookie`
  * `POST /api/login` ou `POST /api/register`
* Token salvo no `localStorage` com a chave `m2s.auth_token`.
* O frontend possui um `UserContextProvider` global para disponibilizar o usuário autenticado em toda a aplicação.
* Quando uma requisição retorna `401`:

  * a sessão local e o token são limpos;
  * o usuário é redirecionado para `/`;
  * as rotas protegidas continuam bloqueadas por meio do `RequireAuth`, inclusive em acessos diretos por URL ou pelo botão Voltar.

## Tema (Light/Dark)

* Tema customizado com base em:

  * Light mode: `#2782DD`
  * Dark mode: `#0C17B6`
* O switch de tema fica no header do `Layout`.
* A preferência é persistida no `localStorage` (`m2s.theme`).

## Estrutura resumida

```text
src/
  app/
    components/
      Layout.tsx
      RequireAuth.tsx
      ui/
    contexts/
      UserContextProvider.tsx
    hooks/
      api/
        config/httpClient.ts
        entities/
          authApi.ts
          devicesApi.ts
          alertsApi.ts
          statisticsApi.ts
          ...
    pages/
      Login.tsx
      Dashboard.tsx
      Dispositivos.tsx
      EnviarAlerta.tsx
      Historico.tsx
      ...
    routes.ts
  styles/
    theme.css
```

## API e dados

* Coleção do Postman: `database/Laravel.postman_collection.json`
* Documentação da modelagem de dados: `database/README.md`

## Observações

* Este frontend foi estruturado para consumir respostas do backend Laravel com envelopes no formato `success/data/message` e variações conforme o endpoint.
* Os hooks de API estão segregados por entidade para facilitar a manutenção e a evolução.
