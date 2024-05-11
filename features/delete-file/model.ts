import { createEvent, restore, sample } from 'effector';
import { ExplorerApi, TreeNodeType } from '@shared/ui';

export const createFileDeletionModel = ({
  explorerApi,
}: {
  explorerApi: ExplorerApi;
}) => {
  const showDialog = createEvent<{
    type: TreeNodeType;
    nodeId: string;
    fileName: string;
  }>();
  const confirm = createEvent<{
    type: TreeNodeType;
    nodeId: string;
  }>();
  const cancel = createEvent();

  const $dialog = restore(showDialog, null).reset([confirm, cancel]);

  sample({
    clock: explorerApi.fromContext.deleteFolder,
    fn: ({ nodeId }) =>
      ({
        nodeId,
        type: 'dir',
        fileName: nodeId.split('/').pop() || nodeId,
      }) as const,
    target: showDialog,
  });
  sample({
    clock: explorerApi.fromContext.deleteFile,
    fn: ({ nodeId }) =>
      ({
        nodeId,
        type: 'file',
        fileName: nodeId.split('/').pop() || nodeId,
      }) as const,
    target: showDialog,
  });

  return {
    showDialog,
    confirm,
    cancel,
    $dialog,
  };
};

export type FileDeletionModel = ReturnType<typeof createFileDeletionModel>;
