import { WebContainer } from "@webcontainer/api";
import { Terminal } from "xterm";

export async function startWebContainerShell(
  terminal: Terminal,
  webContainer: WebContainer
) {
  const shell = await webContainer.spawn("jsh");
  const input = shell.input.getWriter();

  shell.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );

  terminal.onData((data) => {
    input.write(data);
  });

  return {shell, input};
}