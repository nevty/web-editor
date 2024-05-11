import { createEffect } from 'effector';
import { Monaco } from '@monaco-editor/react';
import { WebContainer } from '@webcontainer/api';

import {
  createEditorModelsFromFiles,
  addLibDefenitions,
  monacoTSX,
  deleteEditorModels,
} from '../lib';

export const createSyncEditorModel = () => {
  const updateEditorModelsFx = createEffect<
    {
      paths: string[];
      monaco: Monaco | null;
      webContainer: WebContainer;
    },
    void
  >(async ({ monaco, paths, webContainer }) => {
    if (monaco) {
      const toCreatePahts = deleteEditorModels({ monaco, paths });
      if (toCreatePahts.length > 0)
        await createEditorModelsFromFiles({
          paths: toCreatePahts,
          webContainer,
          monaco,
        });
    }
  });

  const setCompilerOptionsFx = createEffect<
    {
      monaco: Monaco | null;
    },
    void
  >(({ monaco }) => {
    if (monaco) monacoTSX(monaco);
  });

  const addLibsDefenitionsFx = createEffect<
    {
      monaco: Monaco | null;
      webContainer: WebContainer;
      libPaths: string[];
    },
    void
  >(async ({ monaco, webContainer, libPaths }) => {
    if (monaco) {
      libPaths.forEach((libPath) => {
        addLibDefenitions({
          monaco,
          webContainer,
          dirPath: `node_modules/${libPath}`,
        });
      });
    }
  });

  return {
    updateEditorModelsFx,
    setCompilerOptionsFx,
    addLibsDefenitionsFx,
  };
};
