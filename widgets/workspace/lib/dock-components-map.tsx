import { IDockviewPanelProps } from 'dockview';

import { Editor, EditorProps } from '@shared/ui';

export const WORKSPACE_DOCK_COMPONENTS_MAP = {
  editor: ({ params }: IDockviewPanelProps<EditorProps>) => (
    <Editor {...params} />
  ),
};

export type WorkspaceDockComponent = keyof typeof WORKSPACE_DOCK_COMPONENTS_MAP;
