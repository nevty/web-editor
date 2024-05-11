import { Monaco } from '@monaco-editor/react';
import { WebContainer } from '@webcontainer/api';

interface CreateEditorModelsFromFilesParams {
  paths: string[];
  monaco: Monaco;
  webContainer: WebContainer;
}

export const createEditorModelsFromFiles = ({
  paths,
  monaco,
  webContainer,
}: CreateEditorModelsFromFilesParams) => {
  return Promise.allSettled(
    paths.map(async (path) => {
      const content = await webContainer.fs.readFile(path, 'utf-8');

      monaco.editor.createModel(content, undefined, monaco.Uri.parse(path));
    }),
  );
};
