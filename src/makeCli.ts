import { cancel, confirm, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import { join } from 'path';
import enMessages from './i18n/en.json';
import zhMessages from './i18n/zh.json';
import { init } from './init';
import { runCommand } from './runCommand';
import { InitPreset, LintInitConfig } from './types';

export async function makeCli(config: LintInitConfig) {
  // Load i18n messages
  const messages = process.env['LANG']?.startsWith('zh') ? zhMessages : enMessages;

  if (process.argv.length > 2) {
    // Traditional command line
    const command = new Command(config.commandName);

    if (config.presets) {
      command.option(
        '--preset <preset>',
        messages.cmd_presets.replace('{presets}', config.presets.map((item) => item.id).join(', ')),
      );
    }

    if (config.stylelint?.optional || config.presets?.some((p) => p.stylelint?.optional)) {
      command.option('--stylelint', messages.cmd_stylelint);
    }

    if (config.markdownlint?.optional || config.presets?.some((p) => p.markdownlint?.optional)) {
      command.option('--markdownlint', messages.cmd_markdownlint);
    }

    if (config.prettier?.optional || config.presets?.some((p) => p.prettier?.optional)) {
      command.option('--prettier', messages.cmd_prettier);
    }

    command.action(async (project: string, options: any) => {
      const projectPath = project ? join(process.cwd(), project) : process.cwd();
      const preset =
        config.presets && options.preset
          ? config.presets.find((p) => p.id === options.preset)
          : null;

      let stylelint = preset?.stylelint || config.stylelint;
      if (stylelint?.optional && !options.stylelint) {
        stylelint = null;
      }

      let markdownlint = preset?.markdownlint || config.markdownlint;
      if (markdownlint?.optional && !options.markdownlint) {
        markdownlint = null;
      }

      let prettier = preset?.prettier || config.prettier;
      if (prettier?.optional && !options.prettier) {
        prettier = null;
      }

      await init(projectPath, {
        eslint: preset?.eslint || config.eslint,
        stylelint,
        markdownlint,
        prettier,
        editorconfig: preset?.editorconfig || config.editorconfig,
        vscode: preset?.vscode || config.vscode,
      });
    });
  } else {
    // Interactive prompts
    console.log('');

    intro(
      '🚀 ' + chalk.bold(chalk.cyan(config.packageName)) + ' ' + chalk.dim('v' + config.version),
    );

    const projectPath = await text({
      message: '📁 ' + messages.prompt_project,
      initialValue: process.cwd(),
    });

    if (isCancel(projectPath)) {
      cancel('👋 ' + messages.prompt_cancel);
      process.exit(0);
    }

    let preset: InitPreset | null = null;

    if (config.presets) {
      const result = await select<any, string>({
        message: '🧰 ' + messages.prompt_preset,
        options: config.presets?.map((p) => ({ value: p.id, label: p.name })),
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.prompt_cancel);
        process.exit(0);
      }

      preset = config.presets.find((p) => p.id === result) || null;
    }

    const eslint = preset?.eslint || config.eslint || null;

    let stylelint = preset?.stylelint || config.stylelint || null;

    if (stylelint?.optional) {
      const result = await confirm({
        message: '🟣 ' + messages.prompt_stylelint,
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.prompt_cancel);
        process.exit(0);
      }

      stylelint = result ? stylelint : null;
    }

    let markdownlint = preset?.markdownlint || config.markdownlint || null;

    if (markdownlint?.optional) {
      const result = await confirm({
        message: '🟣 ' + messages.prompt_markdownlint,
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.prompt_cancel);
        process.exit(0);
      }

      markdownlint = result ? markdownlint : null;
    }

    let prettier = preset?.prettier || config.prettier || null;

    if (prettier?.optional) {
      const result = await confirm({
        message: '🟣 ' + messages.prompt_prettier,
      });

      if (isCancel(result)) {
        cancel('👋 ' + messages.prompt_cancel);
        process.exit(0);
      }

      prettier = result ? prettier : null;
    }

    const s = spinner();
    s.start('🚧 ' + messages.prompt_initializing);
    try {
      await init(projectPath, {
        eslint,
        stylelint,
        markdownlint,
        prettier,
        editorconfig: preset?.editorconfig || config.editorconfig,
        vscode: preset?.vscode || config.vscode,
      });
      s.stop('🚧 ' + messages.prompt_initialized);
    } catch (e) {
      s.stop('🚧 ' + messages.prompt_initialize_failed);
      console.error(e);
      process.exit(1);
    }

    const installCommand = await select<any, string>({
      message: '📦 ' + messages.prompt_install,
      options: [
        { value: 'npm update', label: 'npm update' },
        { value: 'pnpm update', label: 'pnpm update' },
        { value: 'yarn update', label: 'yarn update' },
        { value: null, label: messages.prompt_skip },
      ],
    });

    if (isCancel(installCommand)) {
      cancel('👋 ' + messages.prompt_cancel);
      process.exit(0);
    }

    if (installCommand) {
      const s2 = spinner();
      s2.start('📦 ' + messages.prompt_installing);
      const code = await runCommand(installCommand);
      if (code === null) {
        s2.stop('👋 ' + messages.prompt_cancel);
      } else if (code === 0) {
        s2.stop('📦 ' + messages.prompt_installed);
      } else {
        s2.stop('📦 ' + code + messages.prompt_installed);
      }
    }

    outro(
      '🎉 ' +
        messages.prompt_thank +
        '\n      ' +
        chalk.underline('https://github.com/guoyunhe/lint-init'),
    );
  }
}
