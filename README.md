
# AlertaTV Frontend Web

Aplicacao frontend do sistema de gerenciamento e envio de alertas para dispositivos (TVs e Raspberry Pi), com dashboard, historico, gerenciamento de dispositivos e autenticacao integrada ao backend Laravel.

## Tecnologias

- React 19 + TypeScript
- Vite 6
- React Router 7
- Tailwind CSS 4 + Radix UI
- Axios
- Recharts

## Requisitos

- Node.js 18+
- npm 9+
- Backend Laravel rodando (padrao `http://localhost:8000`)

## Como executar

1. Instale dependencias:

```bash
npm install
```

2. Inicie em desenvolvimento:

```bash
npm run dev
```

3. Build de producao:

```bash
npm run build
```

## Configuracao de ambiente

O client HTTP usa por padrao `http://localhost:8000`.

Para alterar, crie um arquivo `.env` na raiz:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Rotas principais

- Publica:
  - `/` login/registro
- Protegidas (requer usuario autenticado):
  - `/app` dashboard
  - `/app/dispositivos`
  - `/app/enviar`
  - `/app/historico`
  - `/app/mapa`
  - `/app/configuracoes`
- Admin:
  - `/admin`
  - `/admin/usuarios`

## Autenticacao e sessao

- Fluxo Laravel Sanctum:
  - `GET /sanctum/csrf-cookie`
  - `POST /api/login` ou `POST /api/register`
- Token salvo no `localStorage` com a chave `m2s.auth_token`.
- O frontend possui `UserContextProvider` global para disponibilizar usuario autenticado em toda a aplicacao.
- Quando uma requisicao retorna `401`:
  - sessao local e token sao limpos
  - usuario e redirecionado para `/`
  - rotas protegidas continuam bloqueadas via `RequireAuth` (inclusive acesso direto por URL ou botao voltar)

## Tema (Light/Dark)

- Tema customizado com base em:
  - Light mode: `#2782DD`
  - Dark mode: `#0C17B6`
- O switch de tema fica no header do `Layout`.
- Preferencia persistida no `localStorage` (`m2s.theme`).

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

- Colecao Postman: `database/Laravel.postman_collection.json`
- Documentacao de modelagem de dados: `database/README.md`

## Observacoes

- Este frontend foi estruturado para consumir respostas do backend Laravel com envelopes no formato `success/data/message` e variacoes por endpoint.
- Os hooks de API estao segregados por entidade para facilitar manutencao e evolucao.
  