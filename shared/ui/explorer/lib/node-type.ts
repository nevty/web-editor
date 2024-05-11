import { ExplorerTreeDirNode, ExplorerTreeFileNode } from '../types';

export const isTreeDirNode = (
  node: ExplorerTreeDirNode | ExplorerTreeFileNode,
): node is ExplorerTreeDirNode => node.type === 'dir';

export const isTreeFileNode = (
  node: ExplorerTreeDirNode | ExplorerTreeFileNode,
): node is ExplorerTreeDirNode => node.type === 'file';
