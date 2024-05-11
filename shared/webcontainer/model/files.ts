import { FileSystemTree, WebContainer } from '@webcontainer/api';
import { attach, createEffect, sample } from 'effector';

import { getGithubRepoFileSystemTree } from '../lib';
import { WebcontainerModel } from './init';

interface FilesMount {
  filesTree: FileSystemTree;
  webContainer: WebContainer;
}

type FileSystemPayload = {
  path: string;
  oldPath?: string;
  content?: string;
};

export const createFilesModel = ({
  webContainerModel,
}: {
  webContainerModel: WebcontainerModel;
}) => {
  const { $webContainer } = webContainerModel;

  const mountFilesFx = createEffect<FilesMount, void>(
    ({ filesTree, webContainer }) => {
      return webContainer.mount(filesTree);
    },
  );
  const getFileSystemTreeFx = createEffect(
    ({ githubRepo, apiKey }: { githubRepo: string; apiKey?: string }) => {
      const [owner, repo, ...dirPath] = githubRepo.split('/');
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath.join('/')}`;

      return getGithubRepoFileSystemTree(url, { apiKey });
    },
  );

  const readFileFx = createEffect(
    async ({
      webcontainer,
      path,
    }: FileSystemPayload & { webcontainer: WebContainer }) => {
      return {
        path,
        content: await webcontainer.fs.readFile(path, 'utf-8'),
      };
    },
  );

  const writeFileFx = createEffect(
    async ({
      webcontainer,
      path,
      content = '',
    }: FileSystemPayload & { webcontainer: WebContainer }) => {
      await webcontainer.fs.writeFile(path, content);
      return path;
    },
  );
  const createFolderFx = createEffect(
    async ({
      webcontainer,
      path,
    }: FileSystemPayload & { webcontainer: WebContainer }) => {
      await webcontainer.fs.mkdir(path);
      return path;
    },
  );
  const renameFileFx = createEffect(
    async ({
      webcontainer,
      path,
      oldPath,
    }: FileSystemPayload & { webcontainer: WebContainer }) => {
      if (oldPath) await webcontainer.fs.rename(oldPath, path);
      return path;
    },
  );
  const deleteFx = createEffect(
    async ({
      webcontainer,
      path,
      recursive,
    }: FileSystemPayload & { recursive: boolean } & {
      webcontainer: WebContainer;
    }) => {
      await webcontainer.fs.rm(path, { recursive });
      return path;
    },
  );

  sample({
    clock: getFileSystemTreeFx.doneData,
    source: $webContainer,
    fn: (webContainer, filesTree) => ({ filesTree, webContainer }),
    target: mountFilesFx,
  });

  return {
    getFileSystemTreeFx,
    mountFilesFx,
    readFileFx: attach({
      effect: readFileFx,
      source: $webContainer,
      mapParams: (payload: FileSystemPayload, webcontainer) => ({
        webcontainer,
        ...payload,
      }),
    }),
    writeFileFx: attach({
      effect: writeFileFx,
      source: $webContainer,
      mapParams: (payload: FileSystemPayload, webcontainer) => ({
        webcontainer,
        ...payload,
      }),
    }),
    createFileFx: attach({
      effect: writeFileFx,
      source: $webContainer,
      mapParams: (payload: FileSystemPayload, webcontainer) => ({
        webcontainer,
        ...payload,
      }),
    }),
    createFolderFx: attach({
      effect: createFolderFx,
      source: $webContainer,
      mapParams: (payload: FileSystemPayload, webcontainer) => ({
        webcontainer,
        ...payload,
      }),
    }),
    renameFileFx: attach({
      effect: renameFileFx,
      source: $webContainer,
      mapParams: (payload: FileSystemPayload, webcontainer) => ({
        webcontainer,
        ...payload,
      }),
    }),
    deleteFx: attach({
      effect: deleteFx,
      source: $webContainer,
      mapParams: (
        payload: FileSystemPayload & { recursive: boolean },
        webcontainer,
      ) => ({
        webcontainer,
        ...payload,
      }),
    }),
  };
};

export type FilesModel = Awaited<ReturnType<typeof createFilesModel>>;
