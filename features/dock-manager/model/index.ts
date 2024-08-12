import {
  AddPanelOptions,
  DockviewApi,
  IDockviewPanelProps,
  IDockviewPanel,
} from 'dockview';
import { createEffect, createEvent, restore, sample } from 'effector';

export const createDockManagerModel = <
  Components extends Record<string, React.FunctionComponent<IDockviewPanelProps>>,
>() => {
  type Parameters = React.ComponentProps<Components[keyof Components]>['params'];
  type AddPanelFromCollectionOptions = AddPanelOptions<Parameters> & {
    component: keyof Components;
  };

  const addPanelFx = createEffect<
    {
      api: DockviewApi;
      options: AddPanelFromCollectionOptions;
    },
    AddPanelFromCollectionOptions
  >(({ api, options }) => {
    const panel = api.getPanel(options.id);
    if (panel) {
      panel.api.setActive();
    } else {
      api.addPanel(options);
    }
    return options;
  });

  const closePanelsFx = createEffect<
    {
      api: DockviewApi;
      ids: string[];
    },
    void
  >(({ api, ids }) => {
    ids.forEach((id) => {
      const panel = api.getPanel(id);
      if (panel) {
        panel.api.close();
      }
    });
  });

  const updatePanelFx = createEffect<
    {
      api: DockviewApi;
      id: string;
      parameters: Parameters;
    },
    IDockviewPanel | null
  >(({ api, id, parameters }) => {
    const panel = api.getPanel(id);
    if (panel) {
      panel.api.updateParameters(parameters);
      return panel;
    }
    return null;
  });
  const changeTitleFx = createEffect<
    {
      api: DockviewApi;
      id: string;
      title: string;
    },
    string | null
  >(({ api, id, title }) => {
    const panel = api.getPanel(id);
    if (panel) {
      panel.api.setTitle(title);
      return title;
    }
    return null;
  });

  const setApi = createEvent<DockviewApi>();
  const addPanel = createEvent<AddPanelFromCollectionOptions>();
  const closePanels = createEvent<string[]>();
  const updatePanel = createEvent<{
    id: string;
    parameters: Parameters;
  }>();
  const changeTitle = createEvent<{ id: string; title: string }>();
  const panelClosed = createEvent<string>();
  const panelActiveChanged = createEvent<string | undefined>();

  const $api = restore(setApi, null);

  sample({
    clock: addPanel,
    source: $api,
    filter: Boolean,
    fn: (api, options) => ({ api, options }),
    target: addPanelFx,
  });

  sample({
    clock: closePanels,
    source: $api,
    filter: Boolean,
    fn: (api, ids) => ({ api, ids }),
    target: closePanelsFx,
  });

  sample({
    clock: updatePanel,
    source: $api,
    filter: Boolean,
    fn: (api, { id, parameters }) => ({ api, id, parameters }),
    target: updatePanelFx,
  });

  sample({
    clock: changeTitle,
    source: $api,
    filter: Boolean,
    fn: (api, { id, title }) => ({ api, id, title }),
    target: changeTitleFx,
  });

  return {
    setApi,
    addPanel,
    closePanels,
    panelClosed,
    panelActiveChanged,
    updatePanel,
    changeTitle,
  };
};

export type DockManagerModel = ReturnType<typeof createDockManagerModel>;
