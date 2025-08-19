import { sample } from 'effector';
import { useGate, useUnit } from 'effector-react';
import { combineEvents } from 'patronum';
import { useEffect } from 'react';

import { ExplorerPanel, EditorPanel } from '@widgets/workspace';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  TerminalPanel,
} from '@shared/ui';

import {
  repoGate,
  $filesModel,
  $shellModel,
  $workspaceModel,
  $terminalModel,
  $webContainerModel,
  progressModel,
} from '../_model';

import PreviewPanel from './preview';

const WebEditor = ({ repoPath }: { repoPath: string[] }) => {
  const webContainerModel = useUnit($webContainerModel);
  const terminalModel = useUnit($terminalModel);
  const workspaceModel = useUnit($workspaceModel);
  const filesModel = useUnit($filesModel);
  const shellModel = useUnit($shellModel);

  useGate(repoGate, {
    githubRepo: repoPath.join('/'),
  });

  useEffect(() => {
    if (!webContainerModel) return;
    if (!terminalModel) return;
    if (!workspaceModel) return;
    if (!filesModel) return;
    if (!shellModel) return;

    sample({
      clock: combineEvents([
        filesModel.mountFilesFx.done,
        terminalModel.TerminalGate.open,
      ]),
      target: [
        terminalModel.initTerminal,
        workspaceModel.editorModel.initMonacoFx,
      ],
    });

    sample({
      clock: workspaceModel.editorModel.initMonacoFx.done,
      source: {
        terminal: terminalModel.$terminal,
        webContainer: webContainerModel.$webContainer,
      },
      target: shellModel.installDependenciesFx,
    });

    sample({
      clock: shellModel.installDependenciesFx.done,
      source: {
        terminal: terminalModel.$terminal,
        webContainer: webContainerModel.$webContainer,
      },
      target: shellModel.startServerFx,
    });
  }, [
    webContainerModel,
    terminalModel,
    workspaceModel,
    filesModel,
    shellModel,
  ]);

  if (!webContainerModel) return;
  if (!terminalModel) return;
  if (!workspaceModel) return;
  if (!filesModel) return;
  if (!shellModel) return;

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
          <PreviewPanel
            webContainerModel={webContainerModel}
            $progress={progressModel.$progress}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default WebEditor;
