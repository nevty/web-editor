import { Store } from 'effector';
import { useUnit } from 'effector-react';

import {
  InstallProgress,
  ProgressState,
} from '@features/webcontainer-progress';
import { WebcontainerModel } from '@shared/webcontainer';
import { ScreenNoServerRunning, ScreenWrapper } from './screens';

interface PreviewPanelProps {
  webContainerModel: WebcontainerModel;
  $progress: Store<ProgressState>;
}

const PreviewPanel = ({ webContainerModel, $progress }: PreviewPanelProps) => {
  const server = useUnit(webContainerModel.$server);
  const progress = useUnit($progress);

  if (progress.shouldRender) {
    return (
      <ScreenWrapper className="items-center justify-center">
        <InstallProgress progress={progress} />
      </ScreenWrapper>
    );
  }

  if (!server) {
    return <ScreenNoServerRunning />;
  }

  return <iframe className="w-full h-full border-0" src={server.url}></iframe>;
};

export default PreviewPanel;
