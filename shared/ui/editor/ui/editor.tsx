import { useUnit } from 'effector-react';
import MonacoEditor, { OnChange } from '@monaco-editor/react';
import debounce from 'lodash.debounce';

import { EditorModel } from '../model';
export interface EditorProps {
  path: string;
  model: EditorModel;
}

export const Editor = ({ path, model }: EditorProps) => {
  const createEditor = useUnit(model.createEditor);
  const changeCode = useUnit(model.codeChanged);

  const onChange: OnChange = (newCode) => {
    if (newCode) changeCode({ path, code: newCode });
  };

  const debouncedChange = debounce(onChange, 500);

  return (
    <MonacoEditor
      theme="vs-dark"
      onMount={(editor) => createEditor({ path, editor })}
      path={path}
      options={{ dropIntoEditor: { enabled: false } }}
      onChange={debouncedChange}
    />
  );
};
