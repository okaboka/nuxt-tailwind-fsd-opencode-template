# nuxt-tailwind-fsd-opencode-template

Стартовый шаблон Nuxt-приложения с архитектурой Feature-Sliced Design (FSD),
Tailwind CSS 4 и ручной маршрутизацией. Подходит как основа нового проекта:
содержит минимальный каркас без бизнес-логики.

## Стек

- [Nuxt 4](https://nuxt.com/) (Vue 3, TypeScript, `typescript.strict: true`)
- [Tailwind CSS 4](https://tailwindcss.com/) через `@tailwindcss/vite`
- [Pinia](https://pinia.vuejs.org/) (`@pinia/nuxt`)
- [VueUse](https://vueuse.org/) (`@vueuse/nuxt`)
- ESLint на базе `@nuxt/eslint`
- [Vitest](https://vitest.dev/) — юнит-тесты в node-окружении

## Структура

```
.
├── opencode.json
├── .opencode/
│   └── agents/
│       ├── workflow.md
│       ├── planner.md
│       ├── developer.md
│       └── reviewer.md
├── docs/
│   └── AGENT_WORKFLOW.md
├── error.vue
├── nuxt.config.ts
├── eslint.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── test/
│   ├── mocks/nuxtImports.ts
│   └── unit/
│       ├── apiFetch.spec.ts
│       └── opencodeConfig.spec.ts
└── src/
    ├── app/
    │   ├── layouts/MainLayout.vue
    │   ├── middleware/test.global.ts
    │   ├── plugins/test.client.ts
    │   ├── providers/api/apiFetch.ts
    │   ├── providers/router/routes/routes.ts
    │   └── router.options.ts
    ├── pages/
    │   ├── about/ui/AboutPage.vue
    │   └── home/ui/HomePage.vue
    ├── widgets/
    │   └── appTopbar/ui/AppTopbar.vue
    ├── entities/
    │   └── demo/
    │       ├── service/demoService.ts
    │       ├── types/IDemoDTO.ts
    │       └── ui/DemoCard.vue
    ├── shared/
    │   └── ui/uiButton/ui/UiButton.vue
    └── assets/main.css
```

Слои FSD: `app → pages → widgets → entities → shared`; зависимости — только вниз.
Узкое исключение (как в `AGENTS.md`): сервисам `entities` разрешён импорт
`apiFetch` из `app` (пример — `src/entities/demo/service/demoService.ts`).
Это осознанное документированное исключение, а не техдолг для автоматического
удаления: не переносите `apiFetch` и не устраняйте исключение без отдельного
утверждённого решения. Обратного импорта `app → entities` в шаблоне нет,
поэтому цикл не возникает.

## Требования

- Node.js `^20.19.0 || >=22.12.0` (поле `engines` Nuxt 4)
- npm

## Начало работы

```bash
npm install
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`.

## Команды

| Команда | Действие |
| --- | --- |
| `npm run dev` | Запуск dev-сервера |
| `npm run build` | Production-сборка |
| `npm run generate` | Генерация статического сайта |
| `npm run preview` | Предпросмотр production-сборки |
| `npm run postinstall` | `nuxt prepare` (генерирует `.nuxt`) |
| `npm run analyze` | Анализ бандла (`nuxi analyze`) |
| `npm run test` | Юнит-тесты (Vitest, один прогон) |

Особенности проверок:

- `npm run build` — сборка; отдельного typecheck нет (`typescript.typeCheck` в
  `nuxt.config.ts` не включён, npm-скрипта `typecheck` тоже нет).
- `npm run test` — Vitest в node-окружении.
- `npx eslint .` — не npm-скрипт; выполняется после `nuxt prepare` /
  `npm run postinstall`, без `--fix`.
- Скриптов `lint` и `typecheck` в `package.json` нет.

Команды выше доступны человеку. AI-агентам разрешены только `npm run test`,
`npx eslint .` (без `--fix`) и read-only git-инспекция: build, generate, dev,
preview и analyze агентам запрещены (см. «AI-агенты»).

## Переменные окружения

Базовый адрес API передаётся через переменную окружения:

```bash
NUXT_PUBLIC_API_BASE_URL=https://example.com/api
```

Она читается в `nuxt.config.ts` как `runtimeConfig.public.apiBaseUrl`.
`src/app/providers/api/apiFetch.ts` использует это значение как `baseURL`.
Файл `.env` не коммитится; создайте его локально при необходимости.

## API

`apiFetch` — тонкая типизированная обёртка над `$fetch`, которая только
подставляет `baseURL`. Пример сервиса — `src/entities/demo/service/demoService.ts`
(endpoint `/demo/list` в шаблоне не реализован).

## AI-агенты (opencode)

Шаблон содержит конфигурацию [opencode](https://opencode.ai/) для агентной
разработки:

- `opencode.json` — конфигурация v1-синтаксиса: `default_agent` — `workflow`,
  depth subagent'ов — 1, инструкции — `AGENTS.md`.
- `.opencode/agents/workflow.md` — primary-агент-оркестратор.
- `.opencode/agents/planner.md`, `developer.md`, `reviewer.md` — hidden
  subagent'ы анализа, реализации и независимого ревью.
- `docs/AGENT_WORKFLOW.md` — процесс, шаблоны передачи задач и definition of done.
- `test/unit/opencodeConfig.spec.ts` — config-invariant тест permission-модели и
  frontmatter агентов.

Цикл: Planner → Workflow → утверждение пользователем → Developer → Reviewer →
исправления (не более 3 циклов) → итоговый отчёт. Реализация не начинается без
явного approval gate; задача завершена только при verdict `APPROVED`.
Пользователю вопросы задаёт только Workflow.

Модель permissions (v1; нормативные инварианты — `AGENTS.md`):

- Глобального allow-all нет; `edit` запрещён всем, кроме Developer. Developer —
  единственный редактирующий агент; ему разрешены `src/**`, `test/**`, `docs/**`,
  `README.md`, `error.vue`, `.gitignore`, `.opencode/**`, `opencode.json`,
  `AGENTS.md`, `docs/AGENT_WORKFLOW.md`. Запрещены `package.json`,
  `package-lock.json`, `nuxt.config.ts`, `vitest.config.ts`, `eslint.config.mjs`,
  `tsconfig.json`, `.env`/`.env.*`, `.git/**`.
- Developer может менять собственные permissions и глобальную конфигурацию
  агентов — это принятый риск self-escalation. Reviewer обязан проверять, что
  такие изменения входят в утверждённый план и не ослабляют защиту.
- `bash` — точный allowlist: read-only git, `npm run test` / `npm test`,
  `npx eslint .`; build/generate/dev/preview/analyze агентам запрещены.
- `.env` и `.env.*` запрещены для чтения (кроме `*.env.example`).
- `task`, `question`, `webfetch`, `websearch`, `external_directory` запрещены
  глобально; Workflow получает `question` и allowlist subagent'ов.
- Planner, Developer и Reviewer — hidden subagent'ы без прямого диалога.

Granular-правила `permission.bash` и `permission.edit` применяются в V1
opencode, shell-сканер разбирает подкоманды. Конфигурация использует v1-синтаксис
(`permission`-объект, `default_agent`, `subagent_depth`), а не V2
(`permissions`-массив).

opencode CLI — внешний инструмент и не является зависимостью проекта; в
`package.json` он не добавляется. Конфигурация совместима с v1-синтаксисом
opencode и не требует установки дополнительных пакетов. Глобальные инструменты
opencode (включая MCP-серверы из пользовательской конфигурации) находятся вне
этого проекта и не ограничиваются проектными правилами; проектная защита
распространяется только на файлы и команды репозитория.

## Использование как GitHub Template

1. Нажмите **Use this template** на странице репозитория на GitHub либо
   создайте новый репозиторий из шаблона через `gh`:
   ```bash
   gh repo create my-app --template <owner>/nuxt-tailwind-fsd-opencode-template --private
   ```
2. Клонируйте созданный репозиторий.
3. Выполните `npm install` и `npm run dev`.

`package-lock.json` отслеживается в git и фиксирует зависимости; не удаляйте его.
Каталоги `node_modules`, `.nuxt` и `.output` в шаблоне отсутствуют и исключены из
git.
