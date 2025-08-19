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
