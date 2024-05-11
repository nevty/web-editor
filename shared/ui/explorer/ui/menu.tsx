import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '../../context-menu';

import { CONTEXT_MENU_OPTIONS_TITLES, ContextMenuOption } from '../lib';

const FOLDER_OPTIONS = [
  'newFolder',
  'newFile',
  'rename',
  'deleteFolder',
] satisfies ContextMenuOption[];

export const FolderContextMenu = ({
  children,
  nodeId,
  isDisabled,
  menuSelect,
}: {
  nodeId: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  menuSelect: (payload: { nodeId: string; type: ContextMenuOption }) => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={isDisabled} asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {FOLDER_OPTIONS.map((type) => (
          <ContextMenuItem
            key={type}
            onClick={() => {
              menuSelect({ nodeId, type });
            }}
          >
            {CONTEXT_MENU_OPTIONS_TITLES[type]}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

const FILE_OPTIONS = ['rename', 'deleteFile'] satisfies ContextMenuOption[];

export const FileContextMenu = ({
  children,
  nodeId,
  isDisabled,
  menuSelect,
}: {
  nodeId: string;
  children: React.ReactNode;
  isDisabled?: boolean;
  menuSelect: (payload: { nodeId: string; type: ContextMenuOption }) => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={isDisabled}>{children}</ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {FILE_OPTIONS.map((type) => (
          <ContextMenuItem
            key={type}
            onClick={() => {
              menuSelect({ nodeId, type });
            }}
          >
            {CONTEXT_MENU_OPTIONS_TITLES[type]}
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};
