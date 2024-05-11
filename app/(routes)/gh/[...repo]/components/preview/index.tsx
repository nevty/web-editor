import { useUnit } from 'effector-react';

import { WebcontainerModel } from '@shared/webcontainer';
import { ScreenNoServerRunning } from './screens';

interface PreviewPanelProps {
  webContainerModel: WebcontainerModel;
}

const PreviewPanel = ({ webContainerModel }: PreviewPanelProps) => {
  const server = useUnit(webContainerModel.$server);

  if (!server) return <ScreenNoServerRunning />;

  return <iframe className="w-full h-full border-0" src={server.url}></iframe>;
};

export default PreviewPanel;
