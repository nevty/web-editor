import { loader } from '@monaco-editor/react';
import { type editor as IEditor } from 'monaco-editor';
import {
  createEffect,
  createEvent,
  createStore,
  restore,
  sample,
} from 'effector';

import { FilesModel } from '../../../webcontainer';
import { FileEditable } from '../types';

type StandaloneCodeEditor = IEditor.IStandaloneCodeEditor;
interface createEditorModelProps {
  filesModel: FilesModel;
}

export const createEditorModel = ({ filesModel }: createEditorModelProps) => {
  const initMonacoFx = createEffect(loader.init);
  const createEditor = createEvent<{
    path: string;
    editor: StandaloneCodeEditor;
  }>();
  const disposeEditor = createEvent<string>();
  const codeChanged = createEvent<FileEditable>();

  const $monaco = restore(initMonacoFx.doneData, null);
  const $editorsMap = createStore<Record<string, StandaloneCodeEditor>>({})
    .on(createEditor, (state, { editor, path }) => ({
      ...state,
      [path]: editor,
    }))
    .on(disposeEditor, (record, path) => {
      const editor = record[path];
      if (editor) {
        const newRecord = { ...record };
        editor.dispose();
        delete newRecord[path];
        return newRecord;
      }
      return record;
    });

  sample({
    clock: codeChanged,
    fn: ({ path, code }) => ({ path, content: code }),
    target: filesModel.writeFileFx,
  });

  return {
    initMonacoFx,
    $monaco,
    codeChanged,
    $editorsMap,
    createEditor,
    disposeEditor,
  };
};

export type EditorModel = ReturnType<typeof createEditorModel>;
