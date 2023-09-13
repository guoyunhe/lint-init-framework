import { cancel, intro, isCancel, multiselect, outro, select, spinner, text } from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import { join } from 'path';
import enMessages from './i18n/en.json';
import zhMessages from './i18n/zh.json';
import { init } from './init';
import { runCommand } from './runCommand';
import { InitESLintOptions, InitStylelintOptions, LintInitConfig } from './types';

export async function makeCli(config: LintInitConfig) {
  // Load i18n messages
  const messages = process.env['LANG']?.startsWith('zh') ? zhMessages : enMessages;

  if (process.argv.length > 2) {
    // Traditional command line
    const command = new Command(config.commandName);

    if (config.presets) {
      if (Array.isArray(config.eslint)) {
        command.option(
          '--preset <preset>',
          messages.cmd_presets.replace(
            '{presets}',
            config.eslint.map((item) => item.id).join(', '),
          ),
        );
      }
    }

    if (config.stylelint) {
      command.option('--eslint', messages.cmd_stylelint);
    }

    if (config.stylelint) {
      command.option('--stylelint', messages.cmd_stylelint);
    }

    if (config.markdownlint) {
      command.option('--markdownlint', messages.cmd_markdownlint);
    }

    if (config.prettier) {
      command.option('--prettier', messages.cmd_prettier);
    }

    command.action(async (project: string, options: any) => {
      const projectPath = project ? join(process.cwd(), project) : process.cwd();
      const eslintPreset = options.eslint
        ? Array.isArray(config.eslint)
          ? config.eslint.find((item) => item.id === options.eslint)
          : config.eslint
        : null;
      const stylelintPreset = options.stylelint
        ? Array.isArray(config.stylelint)
          ? config.stylelint.find((item) => item.id === options.stylelint)
          : config.stylelint
        : null;
      await init(projectPath, {
        eslint: eslintPreset,
        stylelint: stylelintPreset,
        markdownlint: options.markdownlint ? config.markdownlint : null,
        prettier: options.prettier ? config.prettier : null,
        editorconfig: config.editorconfig,
        vscode: config.vscode,
      });
    });
  } else {
    // Interactive prompts
    console.log('');

    intro(
      '🚀 ' + chalk.bold(chalk.cyan(config.packageName)) + ' ' + chalk.dim('v' + config.version),
    );

    const projectPath = await text({
      message: '📁 ' + messages.project_path,
      initialValue: process.cwd(),
    });

    if (isCancel(projectPath)) {
      cancel('👋 ' + messages.cancel);
      process.exit(0);
    }

    const linterOptions: { label: string; value: string; hint?: string }[] = [];

    if (config.eslint) {
      linterOptions.push({ value: 'eslint', label: 'ESLint' });
    }
    if (config.stylelint) {
      linterOptions.push({ value: 'stylelint', label: 'Stylelint' });
    }
    if (config.markdownlint) {
      linterOptions.push({ value: 'markdownlint', label: 'Markdownlint' });
    }
    if (config.prettier) {
      linterOptions.push({ value: 'prettier', label: 'Prettier' });
    }

    const linters = await multiselect<any, string>({
      message: '🧰 ' + messages.linters,
      options: linterOptions,
      required: true,
    });

    if (isCancel(linters)) {
      cancel('👋 ' + messages.cancel);
      process.exit(0);
    }

    let eslintPreset: InitESLintOptions | undefined;

    if (linters.includes('eslint') && Array.isArray(config.eslint)) {
      const result = await select<any, string>({
        message: '🔵 ' + messages.eslint_presets,
        options: config.eslint.map((preset) => ({ label: preset.name, value: preset.id })),
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.cancel);
        process.exit(0);
      }

      eslintPreset = config.eslint.find((item) => item.id === result);
    }

    let stylelintPreset: InitStylelintOptions | undefined;

    if (linters.includes('stylelint') && Array.isArray(config.stylelint)) {
      const result = await select<any, string>({
        message: '🟣 ' + messages.stylelint_presets,
        options: config.stylelint.map((preset) => ({ label: preset.name, value: preset.id })),
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.cancel);
        process.exit(0);
      }

      stylelintPreset = config.stylelint.find((item) => item.id === result);
    }

    const s = spinner();
    s.start('🚧 ' + messages.initializing);
    try {
      await init(projectPath, {
        eslint: eslintPreset,
        stylelint: stylelintPreset,
        markdownlint: linters.includes('markdownlint') ? config.markdownlint : null,
        prettier: linters.includes('prettier') ? config.prettier : null,
        editorconfig: config.editorconfig,
        vscode: config.vscode,
      });
      s.stop('🚧 ' + messages.initialized);
    } catch (e) {
      s.stop('🚧 ' + messages.initialize_failed);
      console.error(e);
      process.exit(1);
    }

    const installCommand = await select<any, string>({
      message: '📦 ' + messages.install,
      options: [
        { value: 'npm update', label: 'npm update' },
        { value: 'pnpm update', label: 'pnpm update' },
        { value: 'yarn update', label: 'yarn update' },
        { value: null, label: messages.skip },
      ],
    });

    if (isCancel(installCommand)) {
      cancel('👋 ' + messages.cancel);
      process.exit(0);
    }

    if (installCommand) {
      const s2 = spinner();
      s2.start('📦 ' + messages.installing);
      const code = await runCommand(installCommand);
      if (code === null) {
        s2.stop('👋 ' + messages.cancel);
      } else if (code === 0) {
        s2.stop('📦 ' + messages.installed);
      } else {
        s2.stop('📦 ' + code + messages.installed);
      }
    }

    outro(
      '🎉 ' +
        messages.thank +
        '\n      ' +
        chalk.underline('https://github.com/guoyunhe/lint-init'),
    );
  }
}
