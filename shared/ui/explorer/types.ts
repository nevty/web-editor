export type TreeNodeType = 'file' | 'dir';

export type TreeNodeData = {
  type: TreeNodeType;
  nodeId: string;
  name: string;
  editMode?: boolean;
};

export interface ExplorerTreeNode extends TreeNodeData {
  selected: boolean;
}

export interface ExplorerTreeFileNode extends ExplorerTreeNode {
  type: 'file';
}

export interface ExplorerTreeDirNode extends ExplorerTreeNode {
  type: 'dir';
  opened: boolean;
}

export type ExplorerTreeNodes = Record<
  string,
  Array<ExplorerTreeDirNode | ExplorerTreeFileNode>
>;
