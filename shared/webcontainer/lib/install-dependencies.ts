import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';

export async function installDependencies(
  terminal: Terminal,
  webContainer: WebContainer,
) {
  // TODO: terminal should be in connected state to webcontainer fs
  terminal.write('pnpm i \r');
  const process = await webContainer.spawn('pnpm', ['i']);
  const input = process.input.getWriter();

  process.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    }),
  );
  const terminalStream = terminal.onData((data) => {
    input.write(data);
  });
  const processCode = await process.exit;
  terminalStream.dispose();
  return processCode;
}
