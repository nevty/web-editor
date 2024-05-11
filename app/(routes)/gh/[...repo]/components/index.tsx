import { useGate } from 'effector-react';

import { ExplorerPanel, EditorPanel } from '@widgets/workspace';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  TerminalPanel,
} from '@shared/ui';

import {
  repoGate,
  workspaceModel,
  terminalModel,
  webContainerModel,
} from '../_model';

import PreviewPanel from './preview';

const WebEditor = ({ repoPath }: { repoPath: string[] }) => {
  useGate(repoGate, {
    githubRepo: repoPath.join('/'),
  });

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={23}>
          <ExplorerPanel workspaceModel={workspaceModel} />
        </ResizablePanel>
        <ResizableHandle hitAreaMargins={{ coarse: 0, fine: 0 }} />
        <ResizablePanel defaultSize={43}>
          <ResizablePanelGroup
            direction="vertical"
            className="h-full overflow-hidden"
          >
            <ResizablePanel defaultSize={60}>
              <EditorPanel workspaceModel={workspaceModel} />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={40}>
              <TerminalPanel model={terminalModel} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={34}>
          <PreviewPanel webContainerModel={webContainerModel} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default WebEditor;
