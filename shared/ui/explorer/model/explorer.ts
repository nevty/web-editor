import { combine, createEvent, createStore, sample } from 'effector';

import {
  ExplorerTreeNodes,
  ExplorerTreeFileNode,
  ExplorerTreeDirNode,
  TreeNodeData,
} from '../types';
import { getNodeParentId, getAllNodeParentIds } from '../lib';
import { createContextMenuApi } from './context-menu';

type TreeAddedNode = (ExplorerTreeFileNode | ExplorerTreeDirNode) & {
  parentNodeId: string;
};

export const createExplorerApi = () => {
  const { contextMenuSelect, fromContext } = createContextMenuApi();

  const selectNodes = createEvent<string[] | string>();
  const expandFolders = createEvent<string[]>();
  const closeAllFolders = createEvent();

  const createNode = createEvent<TreeAddedNode>();
  const setEditMode = createEvent<{
    parentNodeId: string;
    nodeId: string;
    editMode: boolean;
  }>();
  const resetCreatedNode = createEvent<TreeAddedNode>();
  // TODO: add to types
  const renameNode = createEvent<{
    type: 'file' | 'dir';
    path: string;
    oldPath?: string;
  }>();

  const $selectedNodes = createStore<string[]>([]).on(
    selectNodes,
    (_, nodes) => (Array.isArray(nodes) ? nodes : [nodes]),
  );
  const $singleSelected = $selectedNodes.map((selected) => selected[0] || null);

  const $expandedFolders = createStore<string[]>([])
    .on(expandFolders, (openedFolders, toggleFolders) => {
      const toClose = toggleFolders.filter((f) => openedFolders.includes(f));
      const toOpen = toggleFolders.filter((f) => !openedFolders.includes(f));

      return openedFolders.filter((s) => !toClose.includes(s)).concat(toOpen);
    })
    .reset(closeAllFolders);

  const $nodesData = createStore<Record<string, TreeNodeData[]>>({})
    .on(setEditMode, (nodesRecord, { nodeId, parentNodeId, editMode }) => {
      return {
        ...nodesRecord,
        [parentNodeId]: [
          ...nodesRecord[parentNodeId].map((n) =>
            n.nodeId === nodeId ? { ...n, editMode } : n,
          ),
        ],
      };
    })
    .on(createNode, (nodesRecord, { parentNodeId, ...node }) => {
      const result = { ...nodesRecord };
      const parentNodes = result[parentNodeId] || [];
      result[parentNodeId] = [...parentNodes, node];

      if (node.type === 'dir') {
        result[node.nodeId] = [];
      }

      return result;
    })
    .on(resetCreatedNode, (nodesRecord, { parentNodeId, nodeId, type }) => {
      const result = { ...nodesRecord };
      result[parentNodeId] = result[parentNodeId].filter(
        (n) => n.nodeId !== nodeId,
      );
      if (type === 'dir') delete result[nodeId];
      return result;
    });

  const $nodesRecord = combine(
    [$nodesData, $selectedNodes, $expandedFolders],
    ([nodesRecord, selectedNodes, expandedFolders]) => {
      return Object.entries(nodesRecord).reduce((acc, [nodeId, nodes]) => {
        acc[nodeId] = nodes.map((node) => {
          const selected = selectedNodes.includes(node.nodeId);
          if (node.type === 'dir') {
            return {
              ...node,
              type: 'dir',
              opened: expandedFolders.includes(node.nodeId),
              selected,
            } satisfies ExplorerTreeDirNode;
          }
          return {
            ...node,
            type: 'file',
            selected,
          } satisfies ExplorerTreeFileNode;
        });
        return acc;
      }, {} as ExplorerTreeNodes);
    },
  );

  sample({
    clock: fromContext.createFile,
    fn: ({ nodeId }): TreeAddedNode => ({
      type: 'file',
      nodeId: `${nodeId}/`,
      name: '',
      editMode: true,
      selected: false,
      parentNodeId: nodeId,
    }),
    target: createNode,
  });

  sample({
    clock: fromContext.createFolder,
    fn: ({ nodeId }): TreeAddedNode => ({
      type: 'dir',
      nodeId: `${nodeId}/`,
      name: '',
      editMode: true,
      selected: false,
      opened: false,
      parentNodeId: nodeId,
    }),
    target: createNode,
  });

  // expand parent folders of selected node if not expanded
  sample({
    clock: sample({
      clock: $singleSelected,
      filter: Boolean,
      fn: getAllNodeParentIds,
    }),
    source: $expandedFolders,
    filter: (expanded, parentIds) => {
      // check for atleast one closed
      return parentIds.some((f) => !expanded.includes(f));
    },
    fn: (expanded, parentIds) => {
      const toExpand = new Set(parentIds);

      // only expand folders not toggle
      expanded.forEach((p) => toExpand.delete(p));

      return Array.from(toExpand);
    },
    target: expandFolders,
  });

  // reset last created node from event if edit mode is false
  sample({
    clock: setEditMode,
    source: createNode,
    filter: (created, edited) =>
      created.nodeId === edited.nodeId && !edited.editMode,
    target: resetCreatedNode,
  });

  sample({
    clock: fromContext.rename,
    fn: ({ nodeId }) => {
      const parentNodeId = getNodeParentId(nodeId) || '/';
      return {
        nodeId,
        parentNodeId,
        editMode: true,
      };
    },
    target: setEditMode,
  });

  // edit after creation
  sample({
    clock: createNode,
    fn: ({ parentNodeId, nodeId }) => ({
      parentNodeId,
      nodeId,
      editMode: true,
    }),
    target: setEditMode,
  });

  sample({
    clock: setEditMode,
    fn: ({ nodeId }) => nodeId,
    target: selectNodes,
  });

  sample({
    clock: resetCreatedNode,
    fn: ({ parentNodeId }) => parentNodeId,
    target: selectNodes,
  });

  return {
    $nodesRecord,
    $nodesData,
    $selectedNodes,
    $singleSelected,
    $expandedFolders,
    selectNodes,
    expandFolders,
    closeAllFolders,
    createNode,
    resetCreatedNode,
    setEditMode,
    renameNode,
    fromContext,
    contextMenuSelect,
  };
};

export type ExplorerApi = ReturnType<typeof createExplorerApi>;
