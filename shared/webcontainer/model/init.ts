import { WebContainer } from '@webcontainer/api';
import { createEvent, createStore, restore, sample } from 'effector';

export const createWebcontainerModel = async () => {
  const webcontainerInstance = await WebContainer.boot();

  const reset = createEvent();
  const serverReady = createEvent<{ port: number; url: string }>();

  const $webContainer =
    createStore<WebContainer>(webcontainerInstance).reset(reset);
  const $server = restore(serverReady, null);

  webcontainerInstance.on('server-ready', (port, url) =>
    serverReady({ port, url }),
  );

  sample({
    clock: reset,
    source: $webContainer,
    fn: (wc) => wc.teardown(),
  });

  return {
    $webContainer,
    $server,
  };
};

export type WebcontainerModel = Awaited<
  ReturnType<typeof createWebcontainerModel>
>;
