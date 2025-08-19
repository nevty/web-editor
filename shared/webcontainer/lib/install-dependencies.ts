import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';

export async function installDependencies(
  terminal: Terminal,
  webContainer: WebContainer,
) {
  const runCommand = async (command: string, args: string[] = []) => {
    const process = await webContainer.spawn(command, args);
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          terminal.write(data);
        },
      }),
    );
    return process.exit;
  };
  
  // TODO: terminal should be in connected state to webcontainer fs
  //fetching dependencies
  terminal.write('\r\n\x1b[1;33mFetching dependencies...\x1b[0m\r\n');
  const fetchExitCode = await runCommand('pnpm', ['fetch']);
  if (fetchExitCode !== 0) {
    terminal.write(
      `\r\n\x1b[1;31mFailed to fetch dependencies. Exit code: ${fetchExitCode}\x1b[0m\r\n`,
    );
    return fetchExitCode;
  }

  // install
  terminal.write('\r\n\x1b[1;33mInstalling dependencies...\x1b[0m\r\n');
  const installExitCode = await runCommand('pnpm', [
    'install',
    '--prefer-offline',
  ]);
  if (installExitCode !== 0) {
    terminal.write(
      `\r\n\x1b[1;31mFailed to install dependencies. Exit code: ${installExitCode}\x1b[0m\r\n`,
    );
  }
  return installExitCode;
}
