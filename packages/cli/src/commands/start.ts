import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { LIMITS, Password, ROUTES } from '@codejam/common';
import { getConfig } from '../config/index.js';
import { ApiClient } from '../api/index.js';
import { openRoomInBrowser, handleError } from '../utils/index.js';

interface StartOptions {
  env?: string;
  custom?: boolean;
  password?: Password;
  hostPassword?: Password;
  max?: string;
  browser?: boolean;
}

function validateMaxParticipants(maxStr: string): number {
  const maxPts = parseInt(maxStr, 10);

  if (isNaN(maxPts) || maxPts < LIMITS.MIN_PTS || maxPts > LIMITS.MAX_PTS) {
    console.error(
      chalk.red(
        `Max participants must be between ${LIMITS.MIN_PTS} and ${LIMITS.MAX_PTS}`,
      ),
    );
    process.exit(1);
  }

  return maxPts;
}

async function createRoom(
  client: ApiClient,
  options: StartOptions,
): Promise<{ roomCode: string; token?: string }> {
  const spinner = ora('Creating room...').start();

  if (options.custom) {
    const maxPts = validateMaxParticipants(
      options.max || String(LIMITS.MAX_CAN_EDIT),
    );

    const response = await client.createCustomRoom({
      maxPts,
      roomPassword: options.password,
      hostPassword: options.hostPassword,
    });

    spinner.succeed(chalk.green('Custom room created!'));
    // response는 서버에서 { roomCode }만 반환
    // 하지만 ApiClient가 Set-Cookie 헤더에서 token을 추출하여 { roomCode, token? }로 확장
    return { roomCode: response.roomCode, token: (response as any).token };
  } else {
    const response = await client.createQuickRoom();

    spinner.succeed(chalk.green('Quick room created!'));
    return { roomCode: response.roomCode };
  }
}

function displayRoomInfo(roomCode: string, options: StartOptions): void {
  const headers = [chalk.cyan.bold('Room Code')];
  const values = [chalk.blue.bold(roomCode)];

  if (options.custom) {
    headers.push(chalk.cyan.bold('Max Participants'));
    values.push(chalk.white(options.max || String(LIMITS.MAX_CAN_EDIT)));

    if (options.password) {
      headers.push(chalk.cyan.bold('Room Password'));
      values.push(chalk.white(options.password));
    }

    if (options.hostPassword) {
      headers.push(chalk.cyan.bold('Host Password'));
      values.push(chalk.white(options.hostPassword));
    }
  }

  const table = new Table({
    head: headers,
  });

  table.push(values);

  console.log('\n' + table.toString());
}

export const startCommand = new Command('start')
  .description('Create and open a CodeJam room')
  .option(
    '-e, --env <environment>',
    'Environment (local|staging|production)',
    'production',
  )
  .option('-c, --custom', 'Create custom room instead of quick room')
  .option('-p, --password <password>', 'Room password (custom room only)')
  .option('--host-password <password>', 'Host password (custom room only)')
  .option('-m, --max <number>', 'Max participants (custom room only)')
  .option('--no-browser', 'Do not open browser automatically')
  .action(async (options: StartOptions) => {
    try {
      // Validate that custom options are only used with --custom flag
      if (!options.custom) {
        if (options.password || options.hostPassword || options.max) {
          console.error(
            chalk.red(
              'Error: --password, --host-password, and --max options require --custom flag',
            ),
          );
          console.log(
            chalk.yellow(
              '\nTo create a custom room, use: codejam start --custom [options]',
            ),
          );
          process.exit(1);
        }
      }

      const config = getConfig(options.env);
      const client = new ApiClient(config.serverUrl);
      const { roomCode, token } = await createRoom(client, options);
      displayRoomInfo(roomCode, options);

      let roomUrl: string;
      if (options.custom && token) {
        // Custom room: use JOIN route with token to save cookie
        roomUrl = `${config.clientUrl}${ROUTES.JOIN(roomCode)}?token=${token}`;
      } else {
        // Quick room: direct to ROOM
        roomUrl = `${config.clientUrl}${ROUTES.ROOM(roomCode)}`;
      }
      await openRoomInBrowser(roomUrl, options.browser !== false);
    } catch (error) {
      handleError('Failed to create room', error);
    }
  });
