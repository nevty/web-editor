
export const getNodeParentId = (nodeId: string) =>
  nodeId.slice(0, nodeId.lastIndexOf('/'));
export const getNodeDepth = (nodeId: string) => nodeId.split('/').length - 1;
export const getAllNodeParentIds = (nodeId: string): string[] => {
  const parentId = getNodeParentId(nodeId)
  const depth = getNodeDepth(nodeId)
  if (depth === 0) return []
  if (depth === 1) {
    return [parentId]
  } else {
    return [...getAllNodeParentIds(parentId), parentId]
  }
}