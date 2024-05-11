import React from 'react';
import { Store } from 'effector';
import { useStoreMap } from 'effector-react';

import { shallowEqualObjects } from '@shared/lib';
import { Accordion, AccordionContent, AccordionItem } from '../../accordion';

import {
  ExplorerTreeNodes,
  ExplorerTreeDirNode,
  ExplorerTreeFileNode,
} from '../types';
import { isTreeDirNode } from '../lib';

interface TreeItemProps {
  $nodes: Store<ExplorerTreeNodes>;
  parentPath?: string;
  renderNode: (
    params: (ExplorerTreeDirNode | ExplorerTreeFileNode) & {
      isEditable?: boolean;
      onEdit?: (path: string, oldPath: string) => void;
    },
  ) => React.ReactNode;
}

export const TreeItem = React.memo(
  ({ $nodes, parentPath = '/', renderNode }: TreeItemProps) => {
    const nodes = useStoreMap({
      store: $nodes,
      keys: [parentPath],
      fn: (nodesRecord, [path]) => nodesRecord[path] || [],
      updateFilter(update, current) {
        if (update.length !== current.length) return true;
        return update.some((updatedNode) => {
          const currentNode = current.find(
            ({ nodeId }) => nodeId === updatedNode.nodeId,
          );

          return !shallowEqualObjects(updatedNode, currentNode);
        });
      },
    });
    const expandedInTree = nodes
      .filter((n) => isTreeDirNode(n) && n.opened)
      .map((n) => n.nodeId);

    return (
      <div role="tree">
        <ul>
          {nodes
            .sort((a, b) => (a.type === 'dir' ? -1 : b.type === 'dir' ? 1 : 0))
            .map((node) => {
              const { nodeId } = node;

              return (
                <li key={nodeId} className="p-0 border-0 rounded-sm">
                  {isTreeDirNode(node) ? (
                    <Accordion type="multiple" value={expandedInTree}>
                      <AccordionItem value={nodeId} className="border-none">
                        {renderNode(node)}
                        <AccordionContent className="pl-4 pb-0">
                          <TreeItem
                            $nodes={$nodes}
                            parentPath={nodeId}
                            renderNode={renderNode}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    renderNode(node)
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    );
  },
);
