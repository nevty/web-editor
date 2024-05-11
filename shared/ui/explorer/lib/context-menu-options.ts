export const CONTEXT_MENU_OPTIONS_TYPES = [
    'newFolder',
    'newFile',
    'rename',
    'deleteFolder',
    'deleteFile',
  ] as const;
  
  export type ContextMenuOption = (typeof CONTEXT_MENU_OPTIONS_TYPES)[number];
  
  export const CONTEXT_MENU_OPTIONS_TITLES = {
    newFolder: 'new folder',
    newFile: 'new file',
    rename: 'rename',
    deleteFile: 'delete',
    deleteFolder: 'delete',
  } as const satisfies Record<ContextMenuOption, string>;
  