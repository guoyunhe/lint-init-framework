export interface LintInitConfig extends InitOptions {
  /**
   * Package name of the lint-init tool, e.g. @org-name/lint-init, awesome-lint-init
   */
  packageName: string;
  /**
   * Command name of the lint-init tool, e.g. lint-init, awesome-lint-init
   */
  commandName: string;
  /**
   * Package version of the lint-init tool
   */
  version: string;
  /**
   * Presets for different type of projects
   */
  presets?: InitPreset[];
}

export interface InitPreset extends InitOptions {
  /**
   * Display name of the preset, e.g. ESLint + React, ESLint + React + TypeScript
   */
  name: string;
  /**
   * Identifier of the preset, used for command line option, e.g. --preset react-typescript
   */
  id: string;
}

export interface InitOptions {
  /**
   * Enable ESLint support
   */
  eslint?: InitESLintOptions | null | undefined;
  /**
   * Enable Stylelint support
   */
  stylelint?: InitStylelintOptions | null | undefined;
  /**
   * Enable Markdownlint support
   */
  markdownlint?: InitMarkdownlintOptions | null | undefined;
  /**
   * Enable Prettier support
   */
  prettier?: InitPrettierOptions | null | undefined;
  /**
   * EditorConfig settings
   */
  editorconfig?: string | null | undefined;
  /**
   * VS Code settings and extensions
   */
  vscode?: InitVSCodeOptions | null | undefined;
}

export interface InitESLintOptions {
  /**
   * devDependencies
   */
  deps?: Record<string, string>;
  /**
   * ESLint configureation
   */
  config: any;
  /**
   * ESLint configuration file name. If array is given, users can choose one from the list and the
   * first will be the default.
   *
   * @default 'package.json'
   */
  configFile?: string | string[];
  /**
   * Content of `.eslintignore` file.
   *
   * If you don't want to create another file, use `ignorePatterns` in config files instead.
   * @see https://eslint.org/docs/latest/use/configure/ignore#ignorepatterns-in-config-files
   */
  ignore?: string;
}

export interface InitStylelintOptions {
  /**
   * devDependencies
   */
  deps?: Record<string, string>;
  /**
   * Stylelint configureation
   */
  config: any;
  /**
   * Stylelint configuration file name. If array is given, users can choose one from the list and the
   * first will be the default.
   */
  configFile?: string | string[];
  /**
   * Content of `.stylelintignore` file.
   *
   * If you don't want to create another file, use `ignoreFiles` in config files instead.
   * @see https://stylelint.io/user-guide/configure#ignorefiles
   */
  ignore?: string;
  /**
   * Make Stylelint optional, can be enabled by --stylelint or yes/no prompts
   */
  optional?: boolean;
}

export interface InitMarkdownlintOptions {
  /**
   * devDependencies of the preset
   */
  deps?: Record<string, string>;
  /**
   * Markdownlint configuration
   * @see https://github.com/DavidAnson/markdownlint
   * @see https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md
   */
  config?: any;
  /**
   * Markdownlint configuration file name. If array is given, users can choose one from the list and the
   * first will be the default.
   *
   * @default '.markdownlint.json'
   */
  configFile?: string | string[];
  /**
   * .markdownlintignore
   */
  ignore?: string;
  /**
   * Make Markdownlint optional, can be enabled by --markdownlint or yes/no prompts
   */
  optional?: boolean;
}

export interface InitPrettierOptions {
  /**
   * devDependencies of the preset
   */
  deps?: Record<string, string>;
  /**
   * Prettier configuration object or package name of shareable configuration. If not specified,
   * Prettier will read `.editorconfig` settings or use built-in defaults.
   * @see https://prettier.io/docs/en/options
   */
  config?: any;
  /**
   * Prettier configuration file name. If array is given, users can choose one from the list and the
   * first will be the default.
   *
   * @default 'package.json'
   */
  configFile?: string | string[];
  /**
   * .prettierignore
   */
  ignore?: string;
  /**
   * Make Prettier optional, can be enabled by --prettier or yes/no prompts
   */
  optional?: boolean;
}

export interface InitVSCodeOptions {
  /**
   * Content of `.vscode/settings.json` file.
   */
  settings: any;
  /**
   * Content of `.vscode/extensions.json` file.
   */
  extensions: any;
}
