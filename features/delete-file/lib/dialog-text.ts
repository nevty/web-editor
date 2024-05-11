import { TreeNodeType } from "@shared/ui";

export const DELETE_DIALOG_TEXT = {
  TITLE: 'Delete',
  DESCRIPTION: (type: TreeNodeType) =>
    `Are you sure you want to delete ${type === 'dir' ? 'directory' : 'file'}`,
  CONFIRM: 'Delete',
  CANCEL: 'Cancel',
} as const;
