export interface LintInitConfig {
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
   * Enable ESLint support
   */
  eslint?: Partial<ESLintInitPreset> | ESLintInitPreset[];
  /**
   * Enable Stylelint support
   */
  stylelint?: Partial<StylelintInitPreset> | StylelintInitPreset[];
  /**
   * Enable Markdownlint support
   */
  markdownlint?: MarkdownlintInitPreset;
  /**
   * Enable Prettier support
   */
  prettier?: PrettierInitPreset;
  /**
   * EditorConfig settings
   */
  editorconfig?: string;
}

export interface ESLintInitPreset {
  /**
   * Display name of the preset, e.g. ESLint + React, ESLint + React + TypeScript
   */
  name: string;
  /**
   * Identifier of the preset, used for command line option, e.g. --eslint react-typescript
   */
  id: string;
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

export interface StylelintInitPreset {
  /**
   * Display name of the preset, e.g. Stylelint + CSS, Stylelint + LESS
   */
  name: string;
  /**
   * Identifier of the preset, used for command line option, e.g. --stylelint scss
   */
  id: string;
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
}

export interface PrettierInitPreset {
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
}

export interface MarkdownlintInitPreset {
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
}
