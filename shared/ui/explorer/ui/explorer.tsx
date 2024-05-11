import useSize from '@react-hook/size';
import { useUnit } from 'effector-react';
import { useCallback, useRef } from 'react';

import { cn } from '@shared/lib';
import { ScrollArea } from '../../scroll-area';

import { ExplorerTreeDirNode, ExplorerTreeFileNode } from '../types';
import { getNodeParentId, isTreeDirNode } from '../lib';
import { ExplorerApi } from '../model';

import { TreeItem } from './tree-item';
import { FileContextMenu, FolderContextMenu } from './menu';
import { File, Folder } from './node';

interface ExplorerProps {
  className?: string;
  api: ExplorerApi;
}

export const Explorer = ({ api, className }: ExplorerProps) => {
  const {
    selectNodes,
    expandFolders,
    contextMenuSelect,
    setEditMode,
    renameNode,
  } = useUnit({
    selectNodes: api.selectNodes,
    expandFolders: api.expandFolders,
    contextMenuSelect: api.contextMenuSelect,
    setEditMode: api.setEditMode,
    renameNode: api.renameNode,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, height] = useSize(containerRef);

  const renderNode = useCallback(
    (node: ExplorerTreeDirNode | ExplorerTreeFileNode) =>
      isTreeDirNode(node) ? (
        <FolderContextMenu nodeId={node.nodeId} menuSelect={contextMenuSelect}>
          <Folder
            node={node}
            onClick={() => {
              if (!node.editMode) expandFolders([node.nodeId]);
              selectNodes([node.nodeId]);
            }}
            onEdit={(path, oldPath) =>
              renameNode({ path, oldPath, type: 'dir' })
            }
            cancelEdit={() => {
              const { nodeId } = node;
              const parentNodeId = getNodeParentId(nodeId) || '/';
              setEditMode({ parentNodeId, nodeId, editMode: false });
            }}
          />
        </FolderContextMenu>
      ) : (
        <FileContextMenu nodeId={node.nodeId} menuSelect={contextMenuSelect}>
          <File
            node={node}
            onClick={() => {
              selectNodes(node.nodeId);
            }}
            onEdit={(path, oldPath) => {
              renameNode({ path, oldPath, type: 'file' });
            }}
            cancelEdit={() => {
              const { nodeId } = node;
              const parentNodeId = getNodeParentId(nodeId) || '/';
              setEditMode({ parentNodeId, nodeId, editMode: false });
            }}
          />
        </FileContextMenu>
      ),
    [selectNodes, expandFolders, contextMenuSelect, setEditMode, renameNode],
  );

  return (
    <div
      ref={containerRef}
      className={cn(className, 'bg-slate-900 text-slate-50')}
    >
      <ScrollArea style={{ width, height }} className="pb-6">
        <div className="w-full h-full relative z-0">
          <TreeItem $nodes={api.$nodesRecord} renderNode={renderNode} />
        </div>
      </ScrollArea>
    </div>
  );
};
