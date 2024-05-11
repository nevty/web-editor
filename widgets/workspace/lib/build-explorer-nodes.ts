import { WebContainer } from '@webcontainer/api';

import {
  ExplorerTreeNodes,
  ExplorerTreeDirNode,
  ExplorerTreeFileNode,
} from '@shared/ui';
import { safeAssign } from '@shared/lib';

export const buildExplorerTreeNodes = async (
  wc: WebContainer,
  path: string,
  ignored: string[] = [],
): Promise<ExplorerTreeNodes> => {
  const nodes: ExplorerTreeNodes = { [path]: [] };
  const files = await wc.fs.readdir(path, { withFileTypes: true });

  await Promise.allSettled(
    files
    .filter((file) => !ignored.includes(file.name))
    .map(async (file) => {
      const nodeId = `${path === '/' ? '' : path}/${file.name}`;
      const node = {
        nodeId,
        name: file.name,
        selected: false,
      };
      if (file.isDirectory()) {
        safeAssign(nodes, await buildExplorerTreeNodes(wc, nodeId, ignored));
        return {
          ...node,
          type: 'dir',
          opened: false,
        } satisfies ExplorerTreeDirNode;
      } else {
        return {
          ...node,
          type: 'file',
        } satisfies ExplorerTreeFileNode;
      }
    }),
  ).then((result) => {
    result.forEach((res) => {
      if (res.status === 'fulfilled') {
        nodes[path].push(res.value);
      }
      if (res.status === 'rejected') {
        console.error(res.reason);
      }
    });
  });

  return nodes;
};
