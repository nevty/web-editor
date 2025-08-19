import { attach, createEffect, createStore, sample } from 'effector';
import { createGate } from 'effector-react';
import { combineEvents, once } from 'patronum';

import { createWorkspaceModel, WorkspaceModel } from '@widgets/workspace';
import { createProgressModel } from '@features/webcontainer-progress';
import { createTerminalModel, TerminalModel } from '@shared/ui';
import {
  createFilesModel,
  createShellModel,
  createWebcontainerModel,
  FilesModel,
  ShellModel,
  WebcontainerModel,
} from '@shared/webcontainer';

const createWebcontainerModelFx = createEffect(createWebcontainerModel);
const createShellModelFx = createEffect(createShellModel);
const createFilesModelFx = createEffect<
  { webContainerModel: WebcontainerModel },
  FilesModel
>(createFilesModel);
const createTerminalModelFx = createEffect<
  { webContainerModel: WebcontainerModel; shellModel: ShellModel },
  TerminalModel
>(createTerminalModel);
const createWorkspaceModelFx = createEffect<
  {
    webContainerModel: WebcontainerModel;
    shellModel: ShellModel;
    filesModel: FilesModel;
  },
  WorkspaceModel
>(createWorkspaceModel);

//TODO: find better way, possibly make WebcontainerModel singleton
export const $webContainerModel = createStore<WebcontainerModel | null>(
  null,
).on(createWebcontainerModelFx.doneData, (_, data) => data);
// TODO: add webcontainer as a dependency
export const $shellModel = createStore<ShellModel | null>(null).on(
  createShellModelFx.doneData,
  (_, data) => data,
);
export const $terminalModel = createStore<TerminalModel | null>(null).on(
  createTerminalModelFx.doneData,
  (_, data) => data,
);
export const $filesModel = createStore<FilesModel | null>(null).on(
  createFilesModelFx.doneData,
  (_, data) => data,
);
export const $workspaceModel = createStore<WorkspaceModel | null>(null).on(
  createWorkspaceModelFx.doneData,
  (_, data) => data,
);

// proxy effects from models
const getFileSystemTreeFx = attach({
  source: $filesModel,
  mapParams: (params: { githubRepo: string; apiKey?: string }, filesModel) => {
    if (!filesModel) {
      console.error('Files model is not initialized!');
      throw new Error('Files model is not initialized!');
    }
    return { params, filesModel };
  },
  effect: createEffect(
    ({
      params,
      filesModel,
    }: {
      params: { githubRepo: string; apiKey?: string };
      filesModel: FilesModel;
    }) => filesModel.getFileSystemTreeFx(params),
  ),
});
export const repoGate = createGate<{ githubRepo: string; apiKey?: string }>(
  'repo',
);

// models creation
sample({
  clock: once(repoGate.open),
  target: [createWebcontainerModelFx, createShellModelFx],
});

sample({
  clock: createWebcontainerModelFx.doneData,
  filter: (webContainerModel: WebcontainerModel | null) =>
    webContainerModel !== null,
  fn: (webContainerModel) => ({ webContainerModel: webContainerModel }),
  target: createFilesModelFx,
});

sample({
  clock: [createShellModelFx.done, createWebcontainerModelFx.done],
  source: { webContainerModel: $webContainerModel, shellModel: $shellModel },
  filter: (source: {
    webContainerModel: WebcontainerModel | null;
    shellModel: ShellModel | null;
  }): source is {
    webContainerModel: WebcontainerModel;
    shellModel: ShellModel;
  } => source.webContainerModel !== null && source.shellModel !== null,
  target: createTerminalModelFx,
});

sample({
  clock: [
    createShellModelFx.done,
    createWebcontainerModelFx.done,
    createFilesModelFx.done,
  ],
  source: {
    webContainerModel: $webContainerModel,
    shellModel: $shellModel,
    filesModel: $filesModel,
  },
  filter: (source: {
    webContainerModel: WebcontainerModel | null;
    shellModel: ShellModel | null;
    filesModel: FilesModel | null;
  }): source is {
    webContainerModel: WebcontainerModel;
    shellModel: ShellModel;
    filesModel: FilesModel;
  } =>
    source.webContainerModel !== null &&
    source.shellModel !== null &&
    source.filesModel !== null,
  target: createWorkspaceModelFx,
});
//

sample({
  clock: combineEvents([repoGate.open, createFilesModelFx.done]),
  fn: ([params]) => params,
  target: getFileSystemTreeFx,
});

// Progress tracking
export const progressModel = createProgressModel();
sample({
  clock: repoGate.open,
  target: progressModel.reset,
});

// Track main effects
progressModel.trackProgress(getFileSystemTreeFx, 'files-load');
progressModel.trackProgress(createWebcontainerModelFx, 'webcontainer-boot');

// Track shell model effects after creation
sample({
  clock: createShellModelFx.done,
  fn: ({ result: shellModel }) => {
    progressModel.trackProgress(
      shellModel.installDependenciesFx,
      'dependencies-install',
    );

    sample({
      clock: shellModel.startServerFx,
      fn: () => 'server-start' as const,
      target: progressModel.startStep,
    });

    sample({
      clock: shellModel.startServerFx.fail,
      fn: ({ error }) => ({
        step: 'server-start' as const,
        error: error.message,
      }),
      target: progressModel.failStep,
    });
  },
});

// complete server-start step
sample({
  clock: createWebcontainerModelFx.done,
  source: { webContainerModel: $webContainerModel },
  filter: (source: {
    webContainerModel: WebcontainerModel | null;
  }): source is { webContainerModel: WebcontainerModel } =>
    source.webContainerModel !== null,
  fn: ({ webContainerModel }) => {
    sample({
      // complete step when server changes only once
      clock: once(webContainerModel.$server),
      filter: (server) => server !== null,
      fn: () => 'server-start' as const,
      target: progressModel.completeStep,
    });
  },
});

// Initialize terminal and editor after all models are created
sample({
  clock: combineEvents([
    createFilesModelFx.done,
    createTerminalModelFx.done,
    createWorkspaceModelFx.done,
  ]),
  source: {
    filesModel: $filesModel,
    terminalModel: $terminalModel,
    workspaceModel: $workspaceModel,
  },
  filter: (source: {
    filesModel: FilesModel | null;
    terminalModel: TerminalModel | null;
    workspaceModel: WorkspaceModel | null;
  }): source is {
    filesModel: FilesModel;
    terminalModel: TerminalModel;
    workspaceModel: WorkspaceModel;
  } =>
    source.filesModel !== null &&
    source.terminalModel !== null &&
    source.workspaceModel !== null,
  fn: ({ filesModel, terminalModel, workspaceModel }) => {
    // Initialize terminal and monaco after files are mounted and terminal gate is open
    sample({
      clock: combineEvents([
        filesModel.mountFilesFx.done,
        terminalModel.TerminalGate.open,
      ]),
      target: [
        terminalModel.initTerminal,
        workspaceModel.editorModel.initMonacoFx,
      ],
    });

    return null;
  },
});

// Initialize shell commands after monaco and terminal are ready
sample({
  clock: combineEvents([
    createTerminalModelFx.done,
    createWorkspaceModelFx.done,
    createShellModelFx.done,
    createWebcontainerModelFx.done,
  ]),
  source: {
    terminalModel: $terminalModel,
    workspaceModel: $workspaceModel,
    shellModel: $shellModel,
    webContainerModel: $webContainerModel,
  },
  filter: (source: {
    terminalModel: TerminalModel | null;
    workspaceModel: WorkspaceModel | null;
    shellModel: ShellModel | null;
    webContainerModel: WebcontainerModel | null;
  }): source is {
    terminalModel: TerminalModel;
    workspaceModel: WorkspaceModel;
    shellModel: ShellModel;
    webContainerModel: WebcontainerModel;
  } =>
    source.terminalModel !== null &&
    source.workspaceModel !== null &&
    source.shellModel !== null &&
    source.webContainerModel !== null,
  fn: ({ terminalModel, workspaceModel, shellModel, webContainerModel }) => {
    sample({
      clock: workspaceModel.editorModel.initMonacoFx.done,
      source: {
        terminal: terminalModel.$terminal,
        webContainer: webContainerModel.$webContainer,
      },
      target: shellModel.installDependenciesFx,
    });

    sample({
      clock: shellModel.installDependenciesFx.done,
      source: {
        terminal: terminalModel.$terminal,
        webContainer: webContainerModel.$webContainer,
      },
      target: shellModel.startServerFx,
    });

    return null;
  },
});
