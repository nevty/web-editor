import { FileSystemTree, DirectoryNode, FileNode } from '@webcontainer/api';
import { safeAssign } from '@shared/lib';

export type OptionsParams = {
  apiKey?: string;
};

interface GithubContentsResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
}

export const getGithubRepoFileSystemTree = async (
  url: string,
  options?: OptionsParams,
): Promise<FileSystemTree> => {
  const fetchOptions: RequestInit = {};

  if (options?.apiKey)
    fetchOptions.headers = {
      Authorization: `Bearer ${options.apiKey}`,
    };

  const contents = await fetch(url, fetchOptions).then(
    (res) => res.json() as Promise<GithubContentsResponse[]>,
  );

  const tree: FileSystemTree = {};

  await Promise.allSettled(
    contents.map(
      async (content): Promise<Record<string, DirectoryNode | FileNode>> => {
        if (content.type === 'file') {
          return {
            [content.name]: {
              file: {
                contents: await fetch(content.download_url).then((res) =>
                  res.text(),
                ),
              },
            },
          };
        }
        if (content.type === 'dir') {
          return {
            [content.name]: {
              directory: await getGithubRepoFileSystemTree(content.url, {
                apiKey: options?.apiKey,
              }),
            },
          };
        }
        throw new Error(`Unsupported file type: ${content.type}`);
      },
    ),
  ).then((result) => {
    result.forEach((res) => {
      if (res.status === 'fulfilled') {
        safeAssign(tree, res.value);
      }
      if (res.status === 'rejected') {
        console.error(res.reason);
      }
    });
  });

  return tree;
};
