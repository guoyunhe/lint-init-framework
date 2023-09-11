import { cancel, intro, isCancel, multiselect, outro, select, spinner, text } from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import enMessages from './i18n/en.json';
import zhMessages from './i18n/zh.json';
import { initProject } from './initProject';
import { runCommand } from './runCommand';
import { ESLintInitPreset, LintInitConfig, StylelintInitPreset } from './types';

export async function makeCli(config: LintInitConfig) {
  // Load i18n messages
  const messages = process.env['LANG']?.startsWith('zh') ? zhMessages : enMessages;

  if (process.argv.length > 2) {
    // Traditional command line
    const command = new Command(config.commandName);

    if (config.eslint) {
      if (Array.isArray(config.eslint)) {
        command.option(
          '--eslint <preset>',
          messages.cmd_eslint_presets.replace(
            '{presets}',
            config.eslint.map((item) => item.id).join(', '),
          ),
        );
      } else {
        command.option('--eslint', messages.cmd_eslint);
      }
    }

    if (config.stylelint) {
      if (Array.isArray(config.stylelint)) {
        command.option(
          '--stylelint <preset>',
          messages.cmd_stylelint_presets.replace(
            '{presets}',
            config.stylelint.map((item) => item.id).join(', '),
          ),
        );
      } else {
        command.option('--stylelint', messages.cmd_stylelint);
      }
    }

    if (config.markdownlint) {
      command.option('--markdownlint', messages.cmd_markdownlint);
    }

    if (config.prettier) {
      command.option('--prettier', messages.cmd_prettier);
    }

    command.option('--no-install', messages.cmd_no_install);
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

    let eslintPreset: ESLintInitPreset | undefined;

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

    let stylelintPreset: StylelintInitPreset | undefined;

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

    // const ci = await select({
    //   message: '🚥 ' + messages.ci,
    //   options: [
    //     { value: 'github-action', label: 'GitHub Action' },
    //     { value: 'gitlab-ci', label: 'GitLab CI' },
    //   ],
    // });

    // if (isCancel(ci)) {
    //   cancel('👋 ' + messages.cancel);
    //   process.exit(0);
    // }

    const s = spinner();
    s.start('🚧 ' + messages.initializing);
    try {
      await initProject(projectPath, {
        eslint: eslintPreset,
        stylelint: stylelintPreset,
        prettier: linters.includes('prettier') ? config.prettier : null,
        markdownlint: linters.includes('markdownlint') ? config.markdownlint : null,
        editorconfig: config.editorconfig,
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
