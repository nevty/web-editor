import { createEvent, split } from 'effector';

import { ContextMenuOption } from '../lib';

type OptionPayload = {
  // TODO: replace with string[], after adding multiple selection
  nodeId: string;
  type: ContextMenuOption;
};

export const createContextMenuApi = () => {
  const contextMenuSelect = createEvent<OptionPayload>();

  const fromContext = split(contextMenuSelect, {
    createFile: ({ type }) => type === 'newFile',
    createFolder: ({ type }) => type === 'newFolder',
    rename: ({ type }) => type === 'rename',
    deleteFile: ({ type }) => type === 'deleteFile',
    deleteFolder: ({ type }) => type === 'deleteFolder',
  });

  return {
    contextMenuSelect,
    fromContext,
  };
};

export type ContextMenuApi = ReturnType<typeof createContextMenuApi>;
