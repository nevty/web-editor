import { DockviewReact } from 'dockview';

import { WorkspaceModel } from '../model';
import { WORKSPACE_DOCK_COMPONENTS_MAP } from '../lib';

interface EditorPanelProps {
  workspaceModel: WorkspaceModel;
}

export const EditorPanel = ({ workspaceModel }: EditorPanelProps) => {
  const dockManager = workspaceModel.dockManager;
  return (
    <DockviewReact
      className="dockview-theme-vs"
      components={WORKSPACE_DOCK_COMPONENTS_MAP}
      onReady={(event) => {
        dockManager.setApi(event.api);
        event.api.onDidRemovePanel((e) => dockManager.panelClosed(e.id));
        event.api.onDidActivePanelChange((e) =>
          dockManager.panelActiveChanged(e && e.id),
        );
      }}
    />
  );
};
