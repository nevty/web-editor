import { FileDeletionDialog } from '@features/delete-file';
import { Explorer } from '@shared/ui';

import { WorkspaceModel } from '../model';

interface ExplorerPanelProps {
  workspaceModel: WorkspaceModel;
}

export const ExplorerPanel = ({ workspaceModel }: ExplorerPanelProps) => {
  const { explorerApi, deletionModel } = workspaceModel;

  return (
    <>
      <Explorer api={explorerApi} className="w-full h-full" />
      <FileDeletionDialog model={deletionModel} />
    </>
  );
};
