import { LintInitConfig } from './types';

const ignore = `node_modules/
build/
coverage/
dist/
`;

export const config: LintInitConfig = {
  packageName: PACKAGE_NAME,
  commandName: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  eslint: [
    {
      id: 'js-base',
      name: 'JavaScript',
      config: {},
      ignore,
    },
    {
      id: 'js-react',
      name: 'JavaScript + React',
      config: {},
      ignore,
    },
    {
      id: 'ts-base',
      name: 'TypeScript',
      config: {},
      ignore,
    },
    {
      id: 'ts-react',
      name: 'TypeScript + React',
      config: {},
      ignore,
    },
  ],
  stylelint: [
    {
      id: 'css',
      name: 'CSS',
      config: {},
      ignore,
    },
    {
      id: 'scss',
      name: 'SCSS',
      config: {},
      ignore,
    },
    {
      id: 'less',
      name: 'LESS',
      config: {},
      ignore,
    },
  ],
  markdownlint: {
    deps: {
      'markdownlint-cli': '0.x',
    },
    config: {
      default: true,
    },
    ignore,
  },
  prettier: {
    deps: {
      prettier: '^3.0.0',
      'prettier-plugin-packagejson': '^2.0.0',
    },
    config: {
      plugins: ['prettier-plugin-packagejson'],
    },
    ignore: `node_modules/
build/
coverage/
dist/
package-lock.json
pnpm-lock.yaml
yarn.lock
`,
  },
};
