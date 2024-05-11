import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';

export async function startServer(
  terminal: Terminal,
  webContainer: WebContainer,
) {
  terminal.write('npm run dev \r');
  const process = await webContainer.spawn('npm', ['run', 'dev']);
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
