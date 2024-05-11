import { WebContainerProcess } from '@webcontainer/api';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { once } from 'patronum';
import { RefObject } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

import { ShellModel, WebcontainerModel } from '../../webcontainer';

type TerminalGateProps = {
  xtermRef: RefObject<HTMLDivElement> | null;
  elementSize: [number, number];
};

export const createTerminalModel = ({
  webContainerModel,
  shellModel,
}: {
  webContainerModel: WebcontainerModel;
  shellModel: ShellModel;
}) => {
  const TerminalGate = createGate<TerminalGateProps>('terminal-gate');

  const resizeTerminalFx = createEffect<
    {
      terminal: Terminal;
      fitAddon: FitAddon;
      shell: WebContainerProcess | null;
    },
    void
  >(({ terminal, fitAddon, shell }) => {
    if (shell) {
      fitAddon.fit();

      shell.resize({
        cols: terminal.cols,
        rows: terminal.rows,
      });
    }
  });

  const initTerminalFx = createEffect<
    { terminal: Terminal; ref: HTMLDivElement | null; fitAddon: FitAddon },
    void
  >(({ terminal, ref, fitAddon }) => {
    if (ref) {
      terminal.open(ref);
      terminal.loadAddon(fitAddon);
    }
  });

  const initTerminal = createEvent();

  const $terminal = createStore(
    new Terminal({
      convertEol: true,
    }),
  );
  const $terminalRef = createStore<HTMLDivElement | null>(null).on(
    TerminalGate.state,
    (_, { xtermRef }) => xtermRef?.current ?? null,
  );
  const $fitAddon = createStore(new FitAddon());

  // start shell on mount
  // TODO: dispose on unmount
  sample({
    clock: once(TerminalGate.open),
    source: {
      terminal: $terminal,
      webContainer: webContainerModel.$webContainer,
    },
    target: shellModel.createWebContainerShellFx,
  });

  sample({
    clock: initTerminal,
    source: {
      terminal: $terminal,
      ref: $terminalRef,
      fitAddon: $fitAddon,
    },
    target: initTerminalFx,
  });

  // resize terminal on container resize / init
  sample({
    clock: [initTerminalFx, TerminalGate.state],
    source: {
      terminal: $terminal,
      fitAddon: $fitAddon,
      webContainerShell: shellModel.$webContainerShell,
    },
    fn: ({ terminal, fitAddon, webContainerShell }) => ({
      terminal,
      fitAddon,
      shell: webContainerShell ? webContainerShell.shell : null,
    }),
    target: resizeTerminalFx,
  });

  return {
    $terminal,
    TerminalGate,
    initTerminal,
  };
};

export type TerminalModel = ReturnType<typeof createTerminalModel>;
