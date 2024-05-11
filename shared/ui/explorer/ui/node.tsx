import { MouseEvent, useMemo, useState } from 'react';
import { BiFileBlank, BiSolidFolder, BiSolidFolderOpen } from 'react-icons/bi';

import { cn, defineLanguage } from '@shared/lib';

import { ExplorerTreeDirNode, ExplorerTreeFileNode } from '../types';
import { FILE_ICON_MAP, getNodeParentId } from '../lib';

export const Folder = ({
  node,
  onEdit,
  cancelEdit,
  ...props
}: {
  node: ExplorerTreeDirNode;
  onEdit: (path: string, oldPath?: string) => void;
  cancelEdit: () => void;
  className?: string;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  const { selected, opened, editMode, nodeId, name } = node;
  return (
    <NodeWrapper
      selected={selected}
      icon={
        opened ? (
          <BiSolidFolderOpen
            className="w-full h-full text-amber-400"
            aria-hidden="true"
          />
        ) : (
          <BiSolidFolder
            className="w-full h-full text-amber-400"
            aria-hidden="true"
          />
        )
      }
      {...props}
    >
      {editMode ? (
        <input
          type="text"
          autoFocus
          onBlur={(e) => {
            const editedValue = e.target.value;
            const parentId = getNodeParentId(nodeId);
            const newId = `${parentId}/${editedValue}`;

            if (editedValue === name) {
              cancelEdit();
            } else if (name === '') {
              onEdit(newId);
            } else {
              onEdit(newId, nodeId);
            }
          }}
          defaultValue={name}
          className="text-sm flex-grow outline-none border-b-[1px] border-white bg-transparent"
        />
      ) : (
        <span className="text-sm text-start flex-grow truncate">{name}</span>
      )}
    </NodeWrapper>
  );
};

export const File = ({
  className,
  node,
  onEdit,
  cancelEdit,
  ...props
}: {
  node: ExplorerTreeFileNode;
  onEdit: (path: string, oldPath?: string) => void;
  cancelEdit: () => void;
  className?: string;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  const { selected, editMode, nodeId, name: defaultName } = node;

  // state for icon extension change
  const [name, setName] = useState(defaultName);
  const { extension } = useMemo(() => defineLanguage(name), [name]);

  return (
    <NodeWrapper
      selected={selected}
      icon={
        extension ? (
          FILE_ICON_MAP[extension]
        ) : (
          <BiFileBlank aria-hidden="true" />
        )
      }
      {...props}
    >
      {editMode ? (
        <input
          type="text"
          autoFocus
          onBlur={(e) => {
            const editedValue = e.target.value;
            const parentId = getNodeParentId(nodeId);
            const newId = `${parentId}/${editedValue}`;

            if (editedValue === defaultName) {
              cancelEdit();
            } else if (defaultName === '') {
              onEdit(newId);
            } else {
              onEdit(newId, nodeId);
            }
          }}
          defaultValue={defaultName}
          onChange={(e) => setName(e.target.value)}
          className="text-sm flex-grow outline-none border-b-[1px] border-white bg-transparent"
        />
      ) : (
        <span className="text-sm text-start flex-grow truncate">
          {defaultName}
        </span>
      )}
    </NodeWrapper>
  );
};

const NodeWrapper = ({
  className,
  selected,
  icon,
  children,
  ...props
}: {
  selected: boolean;
  className?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      className={cn(
        'h-[1.75rem] flex items-center p-1 cursor-pointer focus:outline-0 border-0 hover:no-underline',
        'before:w-full before:h-[1.75rem] before:absolute before:left-0 before:-z-10',
        'before:bg-slate-700 before:opacity-0 hover:before:opacity-100 focus:before:opacity-100',
        className,
        selected &&
          'before:opacity-100 before:border-[1px] before:border-blue-600',
      )}
      {...props}
    >
      <div className="mr-2 w-4 h-4">{icon}</div>
      {children}
    </div>
  );
};
