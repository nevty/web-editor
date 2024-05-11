import { Monaco } from '@monaco-editor/react';

export const monacoTSX = async (monaco: Monaco) => {
  const compilerOptions = {
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    lib: ['ES2020', 'dom', 'dom.iterable'],
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    reactNamespace: 'React',
    skipLibCheck: false,
    allowJs: true,

    typeRoots: ['node_modules/@types'],
  };
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
    compilerOptions,
  );
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
    compilerOptions,
  );

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
};
