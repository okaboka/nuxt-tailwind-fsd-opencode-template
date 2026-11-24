import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type TNode =
  | string
  | number
  | boolean
  | null
  | TNode[]
  | { [key: string]: TNode };

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));

const readText = (relativePath: string): string =>
  readFileSync(join(projectRoot, relativePath), 'utf8');

const parseJson = (relativePath: string): TNode =>
  JSON.parse(readText(relativePath)) as TNode;

const isRecord = (
  value: TNode | undefined,
): value is { [key: string]: TNode } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asRecord = (
  value: TNode | undefined,
  label: string,
): { [key: string]: TNode } => {
  if (!isRecord(value)) {
    throw new Error(`Ожидался объект: ${label}`);
  }
  return value;
};

const unquote = (value: string): string =>
  value.trim().replace(/^["']|["']$/g, '');

const parseScalar = (raw: string): string | number | boolean => {
  const value = unquote(raw);
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }
  return value;
};

const parseFrontmatter = (relativePath: string): { [key: string]: TNode } => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readText(relativePath));
  const body = match?.[1];
  if (body === undefined) {
    throw new Error(`Frontmatter не найден: ${relativePath}`);
  }

  const root: { [key: string]: TNode } = {};
  const stack: Array<{ indent: number; node: { [key: string]: TNode } }> = [
    { indent: -1, node: root },
  ];

  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue;
    }
    const separator = line.indexOf(':');
    if (separator === -1) {
      continue;
    }
    const key = unquote(line.slice(0, separator));
    const rawValue = line.slice(separator + 1).trim();
    const indent = line.length - line.trimStart().length;

    while (stack.length > 1 && indent <= (stack.at(-1)?.indent ?? -1)) {
      stack.pop();
    }
    const parent = stack.at(-1);
    if (parent === undefined) {
      throw new Error(`Некорректный frontmatter: ${relativePath}`);
    }

    if (rawValue === '') {
      const child: { [key: string]: TNode } = {};
      parent.node[key] = child;
      stack.push({ indent, node: child });
    } else {
      parent.node[key] = parseScalar(rawValue);
    }
  }

  return root;
};

describe('opencode.json', () => {
  const root = asRecord(parseJson('opencode.json'), 'opencode.json');
  const permission = asRecord(root['permission'], 'permission');

  it('не содержит глобального allow-all', () => {
    expect(permission['*']).toBeUndefined();
    expect(Object.keys(permission)).not.toContain('*');
  });

  it('запрещает edit и bash по умолчанию', () => {
    expect(asRecord(permission['edit'], 'permission.edit')['*']).toBe('deny');
    expect(asRecord(permission['bash'], 'permission.bash')['*']).toBe('deny');
  });

  it('запрещает task, question, webfetch, websearch и external_directory', () => {
    for (const key of [
      'task',
      'question',
      'webfetch',
      'websearch',
      'external_directory',
    ]) {
      expect(permission[key]).toBe('deny');
    }
  });

  it('запрещает чтение .env и разрешает .env.example после deny-правил', () => {
    const read = asRecord(permission['read'], 'permission.read');
    expect(read['.env']).toBe('deny');
    expect(read['.env.*']).toBe('deny');
    expect(read['**/.env']).toBe('deny');
    expect(read['**/.env.*']).toBe('deny');
    expect(read['*.env']).toBe('deny');
    expect(read['*.env.example']).toBe('allow');

    const keys = Object.keys(read);
    const allowIndex = keys.indexOf('*.env.example');
    expect(allowIndex).toBeGreaterThan(keys.indexOf('.env'));
    expect(allowIndex).toBeGreaterThan(keys.indexOf('.env.*'));
    expect(allowIndex).toBeGreaterThan(keys.indexOf('**/.env'));
    expect(allowIndex).toBeGreaterThan(keys.indexOf('**/.env.*'));
    expect(allowIndex).toBeGreaterThan(keys.indexOf('*.env.*'));
  });

  it('не разрешает build, generate и install в bash (включая префиксные ключи)', () => {
    const bash = asRecord(permission['bash'], 'permission.bash');
    const allowed = Object.keys(bash);
    const forbiddenPrefixes = [
      'npm run build',
      'npm run generate',
      'npm install',
    ];

    for (const key of allowed) {
      for (const prefix of forbiddenPrefixes) {
        expect(key.startsWith(prefix)).toBe(false);
      }
    }

    expect(bash['npm run test']).toBe('allow');
    expect(bash['npx eslint .']).toBe('allow');
  });

  it('.gitignore не исключает отслеживаемый package-lock.json', () => {
    const gitignore = readText('.gitignore');
    const lines = gitignore
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== '' && !line.startsWith('#'));

    expect(lines).not.toContain('package-lock.json');
    expect(lines).not.toContain('/package-lock.json');
  });
});

describe('frontmatter агентов', () => {
  it('workflow: question allow, steps 40 и allowlist subagent\'ов', () => {
    const workflow = parseFrontmatter('.opencode/agents/workflow.md');
    const permission = asRecord(workflow['permission'], 'workflow.permission');
    const task = asRecord(permission['task'], 'workflow task');

    expect(permission['question']).toBe('allow');
    expect(workflow['steps']).toBe(40);
    expect(task['planner']).toBe('allow');
    expect(task['developer']).toBe('allow');
    expect(task['reviewer']).toBe('allow');
  });

  it('planner: hidden, steps 40, task и question deny', () => {
    const planner = parseFrontmatter('.opencode/agents/planner.md');
    const permission = asRecord(planner['permission'], 'planner.permission');

    expect(planner['hidden']).toBe(true);
    expect(planner['steps']).toBe(40);
    expect(permission['task']).toBe('deny');
    expect(permission['question']).toBe('deny');
  });

  it('developer: hidden, steps 80 и согласованные границы edit', () => {
    const developer = parseFrontmatter('.opencode/agents/developer.md');
    const permission = asRecord(developer['permission'], 'developer.permission');
    const edit = asRecord(permission['edit'], 'developer edit');

    expect(developer['hidden']).toBe(true);
    expect(developer['steps']).toBe(80);
    expect(edit['*']).toBe('deny');

    for (const key of [
      'src/**',
      'test/**',
      'docs/**',
      'README.md',
      'error.vue',
      '.gitignore',
      '.opencode/**',
      'opencode.json',
      'AGENTS.md',
      'docs/AGENT_WORKFLOW.md',
    ]) {
      expect(edit[key]).toBe('allow');
    }

    for (const key of [
      'package.json',
      'package-lock.json',
      'nuxt.config.ts',
      'vitest.config.ts',
      'eslint.config.mjs',
      'tsconfig.json',
      '.env',
      '.env.*',
      '.git/**',
      '**/.git/**',
    ]) {
      expect(edit[key]).toBe('deny');
    }

    expect(permission['task']).toBe('deny');
    expect(permission['question']).toBe('deny');
    expect(readText('.opencode/agents/developer.md')).not.toContain(
      'npm run build',
    );
  });

  it('reviewer: hidden, steps 40, read-only и без собственного bash-блока', () => {
    const reviewer = parseFrontmatter('.opencode/agents/reviewer.md');
    const permission = asRecord(reviewer['permission'], 'reviewer.permission');
    const content = readText('.opencode/agents/reviewer.md');

    expect(reviewer['hidden']).toBe(true);
    expect(reviewer['steps']).toBe(40);
    expect(permission['edit']).toBe('deny');
    expect(permission['task']).toBe('deny');
    expect(permission['question']).toBe('deny');
    expect(permission['bash']).toBeUndefined();
    expect(content).not.toContain('npm run build');
  });
});
