import { WebContainer } from '@webcontainer/api';
import { createEffect, createStore, restore, sample } from 'effector';
import { Terminal } from 'xterm';
import {
  installDependencies,
  startWebContainerShell,
  startServer,
} from '../lib';

export const createShellModel = () => {
  const createWebContainerShellFx = createEffect(
    ({
      terminal,
      webContainer,
    }: {
      terminal: Terminal;
      webContainer: WebContainer;
    }) => startWebContainerShell(terminal, webContainer),
  );

  const installDependenciesFx = createEffect<
    { terminal: Terminal; webContainer: WebContainer },
    number
  >(async ({ terminal, webContainer }) => {
    // TODO: jsh terminal carrier gets stuck on process from webcontainer.spawn
    const exitCode = await installDependencies(terminal, webContainer);
    return exitCode;
  });
  const startServerFx = createEffect<
    { terminal: Terminal; webContainer: WebContainer },
    number
  >(async ({ terminal, webContainer }) => {
    const exitCode = await startServer(terminal, webContainer);
    return exitCode;
  });

  const $webContainerShell = restore(createWebContainerShellFx, null);
  const $isDependenciesInstalled = createStore(false);

  sample({
    clock: installDependenciesFx.doneData,
    filter: (exitCode) => exitCode === 0,
    fn: () => true,
    target: $isDependenciesInstalled,
  });

  return {
    createWebContainerShellFx,
    $webContainerShell,
    installDependenciesFx,
    $isDependenciesInstalled,
    startServerFx,
  };
};

export type ShellModel = Awaited<ReturnType<typeof createShellModel>>;
