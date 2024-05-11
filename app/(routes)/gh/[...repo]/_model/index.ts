import { sample } from 'effector';
import { createGate } from 'effector-react';
import { combineEvents } from 'patronum';

import { createWorkspaceModel } from '@widgets/workspace';
import { createTerminalModel } from '@shared/ui';
import {
  createFilesModel,
  createShellModel,
  createWebcontainerModel,
} from '@shared/webcontainer';

export const webContainerModel = await createWebcontainerModel();
// TODO: add webcontainer as a dependency
export const shellModel = createShellModel();
export const terminalModel = createTerminalModel({
  webContainerModel,
  shellModel,
});
export const filesModel = createFilesModel({ webContainerModel });
export const workspaceModel = createWorkspaceModel({
  shellModel,
  filesModel,
  webContainerModel,
});

export const repoGate = createGate<{ githubRepo: string; apiKey?: string }>(
  'repo',
);

sample({
  clock: repoGate.open,
  target: filesModel.getFileSystemTreeFx,
});

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

sample({
  clock: workspaceModel.editorModel.initMonacoFx.done,
  source: {
    terminal: terminalModel.$terminal,
    webContainer: webContainerModel.$webContainer,
  },
  target: shellModel.installDependenciesFx,
})

sample({
  clock: shellModel.installDependenciesFx.done,
  source: {
    terminal: terminalModel.$terminal,
    webContainer: webContainerModel.$webContainer,
  },
  target: shellModel.startServerFx,
})