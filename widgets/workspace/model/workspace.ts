import {
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
  split,
} from 'effector';
import { WebContainer } from '@webcontainer/api';

import {
  FilesModel,
  ShellModel,
  WebcontainerModel,
} from '@shared/webcontainer';
import {
  ExplorerTreeNodes,
  createEditorModel,
  createExplorerApi,
} from '@shared/ui';
import { createDockManagerModel } from '@features/dock-manager';
import { createFileDeletionModel } from '@features/delete-file';

import {
  WORKSPACE_DOCK_COMPONENTS_MAP,
  buildExplorerTreeNodes,
} from '../lib';
import { createSyncEditorModel } from './sync-editor';

export const createWorkspaceModel = ({
  filesModel,
  webContainerModel,
  shellModel,
}: {
  filesModel: FilesModel;
  shellModel: ShellModel;
  webContainerModel: WebcontainerModel;
}) => {
  const explorerApi = createExplorerApi();
  const editorModel = createEditorModel({ filesModel });
  const deletionModel = createFileDeletionModel({ explorerApi });
  const syncModel = createSyncEditorModel();
  const dockManager =
    createDockManagerModel<typeof WORKSPACE_DOCK_COMPONENTS_MAP>();

  const readTreeFx = createEffect<WebContainer, ExplorerTreeNodes>(
    (webcontainer) => {
      return buildExplorerTreeNodes(webcontainer, '/', ['node_modules']);
    },
  );
  const mapFilePaths = createEvent<string[]>();
  const fileSelected = createEvent<string>();

  const $filePaths = restore(mapFilePaths, []);

  sample({
    clock: readTreeFx.doneData,
    target: explorerApi.$nodesData,
  });

  sample({
    clock: readTreeFx.doneData,
    source: $filePaths,
    fn: (filePaths, nodesRecord) => {
      const filePathsSet = new Set(filePaths);
      Object.entries(nodesRecord).map(([_, nodes]) => {
        nodes.forEach((node) => {
          if (node.type === 'file') filePathsSet.add(node.nodeId);
        });
      });
      return Array.from(filePathsSet);
    },
    target: mapFilePaths,
  });

  split({
    source: explorerApi.renameNode,
    match: {
      createFile: ({ type, oldPath }) => type === 'file' && !oldPath,
      createFolder: ({ type, oldPath }) => type === 'dir' && !oldPath,
      renameFile: ({ oldPath }) => !!oldPath,
    },
    cases: {
      createFile: filesModel.createFileFx,
      renameFile: filesModel.renameFileFx,
      createFolder: filesModel.createFolderFx,
    },
  });

  sample({
    clock: deletionModel.confirm,
    fn: ({ nodeId, type }) =>
      ({ path: nodeId, recursive: type === 'dir' }) as const,
    target: filesModel.deleteFx,
  });

  sample({
    clock: deletionModel.confirm,
    source: $filePaths,
    fn: (filePaths, { nodeId, type }) =>
      type === 'file'
        ? [nodeId]
        : filePaths.filter((filePath) => filePath.startsWith(nodeId)),
    target: dockManager.closePanels,
  });

  // update tree
  sample({
    clock: [
      filesModel.mountFilesFx.done,
      filesModel.renameFileFx.done,
      filesModel.createFileFx.done,
      filesModel.createFolderFx.done,
      filesModel.deleteFx.done,
    ],
    source: webContainerModel.$webContainer,
    target: readTreeFx,
  });

  // TODO: select must wait for $filePaths update
  // select after mutation
  // sample({
  //   clock: [
  //     filesModel.renameFileFx.doneData,
  //     filesModel.createFileFx.doneData,
  //     filesModel.createFolderFx.doneData,
  //   ],
  //   target: explorerApi.selectNodes,
  // });

  // emit fileSelected if single file node is selected
  sample({
    clock: sample({
      clock: explorerApi.$singleSelected,
      filter: Boolean,
    }),
    source: $filePaths,
    filter: (filePaths, selected) => filePaths.includes(selected),
    fn: (_, selected) => selected,
    target: fileSelected,
  });

  // delete then create editor models
  sample({
    // additional initMonacoFx.done, to prevent early trigger when monaco is null
    clock: [$filePaths, editorModel.initMonacoFx.done],
    source: {
      paths: $filePaths,
      monaco: editorModel.$monaco,
      webContainer: webContainerModel.$webContainer,
    },
    target: syncModel.updateEditorModelsFx,
  });

  sample({
    clock: shellModel.$isDependenciesInstalled,
    filter: Boolean,
    source: {
      monaco: editorModel.$monaco,
      webContainer: webContainerModel.$webContainer,
      libPaths: createStore(['@types']),
    },
    target: [syncModel.setCompilerOptionsFx, syncModel.addLibsDefenitionsFx],
  });

  sample({
    clock: fileSelected,
    fn: (path) =>
      ({
        id: path,
        component: 'editor',
        title: path.split('/').pop() || path,
        params: {
          model: editorModel,
          path,
        },
      }) as const,
    target: dockManager.addPanel,
  });

  sample({
    clock: dockManager.panelClosed,
    target: editorModel.disposeEditor,
  });

  sample({
    clock: dockManager.panelActiveChanged,
    fn: (path) => (path ? [path] : []),
    target: explorerApi.selectNodes,
  });

  return {
    fileSelected,
    explorerApi,
    editorModel,
    dockManager,
    deletionModel,
  };
};

export type WorkspaceModel = ReturnType<typeof createWorkspaceModel>;
