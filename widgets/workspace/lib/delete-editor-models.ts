import { Monaco } from '@monaco-editor/react';

interface DeleteEditorModelsParams {
  paths: string[];
  monaco: Monaco;
}

export const deleteEditorModels = ({
  monaco,
  paths,
}: DeleteEditorModelsParams) => {
  const uniquePaths = new Set(paths);
  monaco.editor.getModels().forEach((model) => {
    const isExist = uniquePaths.has(model.uri.path);
    if (isExist) {
      uniquePaths.delete(model.uri.path);
    } else {
      model.dispose();
    }
  });

  return Array.from(uniquePaths);
};
