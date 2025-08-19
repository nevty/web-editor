import { createEvent, createStore, sample, Effect } from 'effector';

export const STEP_ORDER = [
  'files-load',
  'webcontainer-boot',
  'dependencies-install',
  'server-start',
] as const;

export type ProgressStep = (typeof STEP_ORDER)[number];

export const STEP_LABELS = {
  'files-load': 'Uploading files',
  'webcontainer-boot': 'Booting WebContainer',
  'dependencies-install': 'Installing dependencies',
  'server-start': 'Starting the server',
} satisfies Record<ProgressStep, string>;

export type ProgressState = {
  currentStep: ProgressStep | null;
  completedSteps: ProgressStep[];
  isLoading: boolean;
  error: string | null;
  isCompleted: boolean;
  shouldRender: boolean;
};

export const createProgressModel = () => {
  const startStep = createEvent<ProgressStep>();
  const completeStep = createEvent<ProgressStep>();
  const failStep = createEvent<{ step: ProgressStep; error: string }>();
  const reset = createEvent();

  const $progress = createStore<ProgressState>({
    currentStep: null,
    completedSteps: [],
    isLoading: false,
    error: null,
    isCompleted: false,
    shouldRender: false,
  });

  sample({
    clock: startStep,
    source: $progress,
    fn: (state, step) => ({
      ...state,
      currentStep: step,
      isLoading: true,
      error: null,
      shouldRender: !state.isCompleted,
    }),
    target: $progress,
  });

  sample({
    clock: completeStep,
    source: $progress,
    fn: (state, step) => {
      const newCompletedSteps = [...state.completedSteps, step];
      const isCompleted = newCompletedSteps.length === STEP_ORDER.length;

      return {
        ...state,
        currentStep: null,
        completedSteps: newCompletedSteps,
        isLoading: false,
        isCompleted,
        shouldRender: !isCompleted,
      };
    },
    target: $progress,
  });

  sample({
    clock: failStep,
    source: $progress,
    fn: (state, { error }) => ({
      ...state,
      currentStep: null,
      isLoading: false,
      error,
    }),
    target: $progress,
  });

  sample({
    clock: reset,
    fn: () => ({
      currentStep: null,
      completedSteps: [],
      isLoading: false,
      error: null,
      isCompleted: false,
      shouldRender: false,
    }),
    target: $progress,
  });

  const trackProgress = (effect: Effect<any, any, any>, step: ProgressStep) => {
    sample({
      clock: effect,
      fn: () => step,
      target: startStep,
    });

    sample({
      clock: effect.done,
      fn: () => step,
      target: completeStep,
    });

    sample({
      clock: effect.fail,
      fn: ({ error }) => ({ step, error: error.message }),
      target: failStep,
    });
  };

  return {
    $progress,
    startStep,
    completeStep,
    failStep,
    reset,
    trackProgress,
  };
};

export type ProgressModel = ReturnType<typeof createProgressModel>;
