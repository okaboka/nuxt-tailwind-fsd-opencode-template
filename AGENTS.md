# Правила шаблона (Nuxt 4 + FSD)

Шаблон Nuxt-приложения с Tailwind CSS 4 и архитектурой Feature-Sliced Design.
Описание стека, структуры и команд — `README.md`. Процесс и handoff агентов —
`docs/AGENT_WORKFLOW.md`, оркестрация — `.opencode/agents/`.

## Стек

- Nuxt 4, Vue 3 Composition API, TypeScript (`typescript.strict: true`).
- Tailwind CSS 4 через `@tailwindcss/vite`.
- Pinia (`@pinia/nuxt`), VueUse (`@vueuse/nuxt`).
- ESLint на базе `@nuxt/eslint`.
- Vitest — юнит-тесты в node-окружении (`npm run test`).

## Архитектура

- Слои FSD: `app`, `pages`, `widgets`, `entities`, `shared`. Зависимости — только
  вниз по порядку `app → pages → widgets → entities → shared`; `shared` не
  импортирует `entities`.
- Из `app` нижележащим слоям разрешён импорт только `apiFetch`
  (`src/app/providers/api/apiFetch.ts`), и то сервисам `entities`.
- Импорт `apiFetch` в `src/entities/demo/service/demoService.ts` — осознанное
  документированное исключение из правила «зависимости только вниз», а не
  техдолг. Не переноси `apiFetch` и не устраняй исключение без отдельного
  утверждённого решения; не расширяй его на другие слои или случаи.
- `imports.autoImport: false`: всё импортируется явно; примитивы Vue/Nuxt
  (`ref`, `computed`, `defineNuxtPlugin`, `defineNuxtRouteMiddleware`,
  `useRuntimeConfig`) — из `#imports`.
- Алиасы `app`, `pages`, `widgets`, `shared`, `entities` объявлены в
  `nuxt.config.ts` и указывают на соответствующие каталоги `src/`.
- Никаких `index.ts`, barrel- и re-export-файлов; импорт по конкретному пути.
- Именование: enum — `E*`, interface — `I*`, type alias — `T*`; имя файла
  совпадает с именем типа. Сервисы — `xxxService.ts`, UI — `PascalCase.vue`.
- Порядок групп импортов: (1) `import type`, (2) enum, (3) остальные; внутри
  группы — сначала библиотеки, затем файлы проекта.

## Маршрутизация

- Маршруты задаются вручную:
  `src/app/router.options.ts` → `src/app/providers/router/routes/routes.ts`.
- Страница ошибки — не маршрут: корневой `error.vue`, навигация на главную
  строкой `to="/"`.

## API

- HTTP-запросы — через `src/app/providers/api/apiFetch.ts` и сервисы
  `src/entities/*/service`.
- `apiFetch` только подставляет `baseURL` из `runtimeConfig.public.apiBaseUrl`.
- Адрес API задаётся переменной окружения `NUXT_PUBLIC_API_BASE_URL`.
- Демо-сервис `demoService` обращается к `/demo/list`; endpoint в шаблоне не
  реализован.

## Плагины и middleware

- `src/app/plugins/test.client.ts` — client-only плагин с `console.info`, пример
  точки расширения.
- `src/app/middleware/test.global.ts` — глобальный client-only middleware; на
  сервере сразу выходит.

## Оркестрация агентов

- Оркестрация — `.opencode/agents/workflow.md`; процесс, handoff и definition of
  done — `docs/AGENT_WORKFLOW.md` (здесь не дублируются).
- Цикл: Planner → Workflow → утверждение пользователем → Developer → Reviewer →
  исправления → итоговый отчёт. Реализация не начинается без approval gate.
- Не более 3 циклов исправлений. На 4-й цикл Workflow останавливается, ставит
  `BLOCKED`, перечисляет неустранённые Critical/High и задаёт вопрос
  пользователю.
- Задача завершена только при `Reviewer verdict = APPROVED`; `NEEDS FIXES` и
  `BLOCKED` означают, что задача не завершена.
- Developer получает полный утверждённый план, acceptance criteria и ограничения
  scope; без утверждённого плана он отказывается и возвращает задачу Workflow.
- С пользователем общается только Workflow; Planner, Developer и Reviewer —
  hidden subagent'ы без прямого диалога.
- Агенты не выполняют git-операции, меняющие состояние или историю репозитория:
  разрешена только read-only инспекция.
- Open Questions по неоднозначному поведению не решаются агентами: вопрос
  выносит Planner, Developer останавливается, Reviewer ставит BLOCKED, а
  пользователю его задаёт Workflow.

## Безопасность и permissions агентов

- Глобальный allow-all (`permission."*": "allow"`) запрещён. Источник
  конфигурации — `opencode.json` и frontmatter `.opencode/agents/*.md`.
- `permission.edit` глобально — `deny`. Developer — единственный агент с
  правом редактирования. Ему разрешены `src/**`, `test/**`, `docs/**`,
  `README.md`, `error.vue`, `.gitignore`, `.opencode/**`, `opencode.json`,
  `AGENTS.md`, `docs/AGENT_WORKFLOW.md`. Запрещены `package.json`,
  `package-lock.json`, `nuxt.config.ts`, `vitest.config.ts`, `eslint.config.mjs`,
  `tsconfig.json`, `.env`, `.env.*`, `.git/**`, `**/.git/**`.
- Developer может менять собственные permissions и глобальную конфигурацию
  агентов — это принятый риск self-escalation. Reviewer обязан проверять, что
  такие изменения входят в утверждённый план и не ослабляют защиту.
- `permission.bash` — только точный allowlist: read-only git (`git status`,
  `git status --short`, `git status --porcelain`, `git diff`, `git diff --stat`,
  `git diff --cached`, `git log`, `git log --oneline`, `git show`,
  `git show --stat`, `git branch --list`, `git rev-parse HEAD`, `git ls-files`,
  `git remote -v`, `git tag --list`), `npm run test`, `npm test`,
  `npx eslint .`. Составные команды и редиректы (`;`, `&&`, `||`, `|`, `>`,
  `>>`) запрещены.
- `read` разрешён, но `.env` и `.env.*` запрещены; исключение — `*.env.example`.
- `task`, `question`, `webfetch`, `websearch`, `external_directory` запрещены
  глобально; Workflow получает `question` и allowlist subagent'ов.
- `build`, `generate`, `dev`, `preview`, `analyze` агентам запрещены. В отчётах
  сборка указывается как «не запускалась (запрещена политикой)».
- Глобальные инструменты opencode (включая MCP-серверы пользовательской
  конфигурации) находятся вне проекта и проектными правилами не ограничиваются.

## Проверки

Реальные скрипты заданы в `package.json`: `npm run dev`, `npm run build`,
`npm run generate`, `npm run preview`, `npm run postinstall`, `npm run analyze`,
`npm run test`.

- Сборка: `npm run build` (только человеком; агентам build/generate/dev/
  preview/analyze запрещены).
- `npm run build` не заменяет typecheck: `typescript.typeCheck` не включён
  (`typescript.strict` задаёт только строгий режим), npm-скрипта `typecheck`
  нет. Чтобы включить проверку типов, задайте `typescript.typeCheck` в
  `nuxt.config.ts` и используйте `nuxt typecheck`.
- Тесты: `npm run test` (`vitest run`, один прогон; конфигурация —
  `vitest.config.ts`, тесты — `test/unit`).
- ESLint: отдельного npm-скрипта нет; `eslint.config.mjs` опирается на
  сгенерированный `.nuxt/eslint.config.mjs`, поэтому `npx eslint .` выполняется
  только после `nuxt prepare` / `npm run postinstall` и без `--fix`.
- Агентам разрешены только `npm run test`, `npx eslint .` без `--fix` и
  read-only git-инспекция.
- Скриптов `lint` и `typecheck` нет — не вызывайте и не заявляйте их как
  существующие.
- `package-lock.json` отслеживается в git и фиксирует зависимости; не удаляйте
  его. Проверки выполняются только после локальной установки зависимостей.

Не утверждайте, что проверка пройдена, если она не запускалась.
