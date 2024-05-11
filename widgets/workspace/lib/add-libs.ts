import { Monaco } from '@monaco-editor/react';
import { WebContainer } from '@webcontainer/api';

const MAX_DEPTH = 5;

export const addLibDefenitions = async ({
  monaco,
  webContainer,
  dirPath,
  depth = 0,
}: {
  monaco: Monaco;
  webContainer: WebContainer;
  dirPath: string;
  depth?: number;
}) => {
  const files = await webContainer.fs.readdir(dirPath, {
    withFileTypes: true,
  });

  if (depth >= MAX_DEPTH) console.log('max depth reach');

  await Promise.allSettled(
    files.map(async (file) => {
      const defenitionPath = `${dirPath}/${file.name}`;
      if (file.isFile()) {
        if (file.name.endsWith('d.ts')) {
          const defenitionContent = await webContainer.fs.readFile(
            defenitionPath,
            'utf-8',
          );
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            defenitionContent,
            `file:///${defenitionPath}`,
          );
          monaco.languages.typescript.javascriptDefaults.addExtraLib(
            defenitionContent,
            `file:///${defenitionPath}`,
          );
        }
      } else if (file.isDirectory() && depth < MAX_DEPTH) {
        await addLibDefenitions({
          monaco,
          webContainer,
          dirPath: defenitionPath,
          depth: depth + 1,
        });
      }
    }),
  );
};
