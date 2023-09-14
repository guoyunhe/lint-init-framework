import glob from 'fast-glob';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import sortPackageJson from 'sort-package-json';
import { InitOptions } from './types';

export async function init(projectPath: string, options: InitOptions) {
  let packageJson: any = {};
  const vscodeSettings: any = {
    'editor.codeActionsOnSave': {},
    ...options.vscode?.settings,
  };
  const vscodeExtensions: any = {
    recommendations: [],
    ...options.vscode?.extensions,
  };
  const lintScripts: string[] = [];
  const lintFixScripts: string[] = [];

  try {
    const packageJsonRaw = await readFile(join(projectPath, 'package.json'), 'utf8');
    packageJson = JSON.parse(packageJsonRaw);
  } catch (e) {
    //
  }

  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }

  if (options.eslint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      eslint: '^8.0.0',
      ...options.eslint.deps,
    };

    lintScripts.push('eslint .');
    lintFixScripts.push('eslint --fix .');

    vscodeSettings['eslint.validate'] = [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
    ];
    vscodeSettings['editor.codeActionsOnSave']['source.fixAll.eslint'] = true;
    vscodeSettings['editor.codeActionsOnSave']['organizeImports'] = true;
    vscodeExtensions.recommendations.push('dbaeumer.vscode-eslint');

    const config = options.eslint.config || {};

    if (options.prettier) {
      packageJson.devDependencies['eslint-config-prettier'] = '^9.0.0';
      packageJson.devDependencies['eslint-plugin-prettier'] = '^5.0.0';
      if (!config.extends) {
        config.extends = [];
      }
      config.extends.push('plugin:prettier/recommended');
    }

    await writeFile(join(projectPath, '.eslintrc.json'), JSON.stringify(config, null, 2), 'utf8');

    if (options.eslint.ignore) {
      await writeFile(join(projectPath, '.eslintignore'), options.eslint.ignore, 'utf8');
    }
  } else {
    await Promise.all(
      await glob(['.eslintrc', '.eslintrc.*', '.eslintignore'], { cwd: projectPath }),
    );
    delete packageJson.eslintConfig;
  }

  if (options.stylelint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      stylelint: '^15.0.0',
      ...options.stylelint.deps,
    };

    vscodeSettings['stylelint.validate'] = ['css', 'less', 'postcss', 'scss'];
    vscodeSettings['editor.codeActionsOnSave']['source.fixAll.stylelint'] = true;
    vscodeExtensions.recommendations.push('stylelint.vscode-stylelint');

    lintScripts.push('stylelint "**/*.{css,less,scss}"');
    lintFixScripts.push('stylelint --fix "**/*.{css,less,scss}"');

    const config = options.stylelint.config || {};

    if (options.prettier) {
      packageJson.devDependencies['stylelint-prettier'] = '^4.0.2';
      if (!config.extends) {
        config.extends = [];
      }
      config.extends.push('stylelint-prettier/recommended');
    }

    await writeFile(
      join(projectPath, '.stylelintrc.json'),
      JSON.stringify(options.stylelint.config, null, 2),
      'utf8',
    );

    if (options.stylelint.ignore) {
      await writeFile(join(projectPath, '.stylelintignore'), options.stylelint.ignore, 'utf8');
    }
  } else {
    await Promise.all(
      await glob(['.stylelintrc', '.stylelintrc.*', '.stylelintignore'], { cwd: projectPath }),
    );
    delete packageJson.stylelint;
  }

  if (options.markdownlint) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      ['markdownlint-cli']: '0.x',
      ...options.markdownlint.deps,
    };

    lintScripts.push('markdownlint **/*.md');
    lintFixScripts.push('markdownlint --fix **/*.md');

    vscodeExtensions.recommendations.push('DavidAnson.vscode-markdownlint');

    if (options.markdownlint.config) {
      await writeFile(
        join(projectPath, '.markdownlint.json'),
        JSON.stringify(options.markdownlint.config, null, 2),
        'utf8',
      );
    }

    if (options.markdownlint.ignore) {
      await writeFile(
        join(projectPath, '.markdownlintignore'),
        options.markdownlint.ignore,
        'utf8',
      );
    }
  } else {
    await Promise.all(await glob(['.markdownlint.*', '.markdownlintignore'], { cwd: projectPath }));
    delete packageJson.prettier;
  }

  if (options.prettier) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      prettier: '^3.0.0',
      ...options.prettier.deps,
    };

    lintFixScripts.push('prettier --write .');

    vscodeSettings['editor.defaultFormatter'] = 'esbenp.prettier-vscode';
    vscodeExtensions.recommendations.push('esbenp.prettier-vscode');

    if (options.prettier.config) {
      await writeFile(
        join(projectPath, '.prettierrc.json'),
        JSON.stringify(options.prettier.config, null, 2),
        'utf8',
      );
    }

    if (options.prettier.ignore) {
      await writeFile(join(projectPath, '.prettierignore'), options.prettier.ignore, 'utf8');
    }
  } else {
    await Promise.all(
      await glob(['.prettierrc', '.prettierrc.*', '.prettierignore'], { cwd: projectPath }),
    );
    delete packageJson.prettier;
  }

  if (options.editorconfig) {
    vscodeExtensions.recommendations.push('editorconfig.editorconfig');
    await writeFile(join(projectPath, '.editorconfig'), options.editorconfig, 'utf8');
  }

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts.lint = lintScripts.join(' && ');
  packageJson.scripts['lint:fix'] = lintFixScripts.join(' && ');

  packageJson = sortPackageJson(packageJson);

  await writeFile(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');

  await mkdir(join(projectPath, '.vscode'), { recursive: true });

  await writeFile(
    join(projectPath, '.vscode', 'settings.json'),
    JSON.stringify(vscodeSettings, null, 2),
    'utf8',
  );

  await writeFile(
    join(projectPath, '.vscode', 'extensions.json'),
    JSON.stringify(vscodeExtensions, null, 2),
    'utf8',
  );
}
