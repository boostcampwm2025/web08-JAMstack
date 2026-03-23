import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import { CLI_PACKAGE_NAME, PROJECT_NAME } from '@codejam/common';
import { handleError } from '../utils/index.js';
import packageJson from '../../package.json' with { type: 'json' };

const execAsync = promisify(exec);

function getCurrentVersion(): string {
  return packageJson.version;
}

async function getLatestVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync(`npm view ${CLI_PACKAGE_NAME} version`);
    return stdout.trim();
  } catch (error) {
    throw new Error('Failed to fetch latest version from npm registry');
  }
}

async function updatePackage(): Promise<void> {
  try {
    await execAsync(`npm install -g ${CLI_PACKAGE_NAME}@latest`);
  } catch (error) {
    throw new Error('Failed to install latest version');
  }
}

export const updateCommand = new Command('update')
  .description(`Update ${PROJECT_NAME} CLI to the latest version`)
  .action(async () => {
    try {
      const spinner = ora('Checking for updates...').start();

      const currentVersion = getCurrentVersion();
      const latestVersion = await getLatestVersion();

      if (currentVersion === latestVersion) {
        spinner.succeed(
          chalk.green(
            `You are already using the latest version (${currentVersion})`,
          ),
        );
        return;
      }

      spinner.text = `Updating from ${currentVersion} to ${latestVersion}...`;

      await updatePackage();

      spinner.succeed(
        chalk.green(`Successfully updated to version ${latestVersion}!`),
      );
      console.log(
        chalk.gray(
          '\nUpdate complete. If the command does not work, try opening a new terminal tab.',
        ),
      );
    } catch (error) {
      handleError('Failed to update', error);
    }
  });
