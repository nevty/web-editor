import { ProgressState, STEP_LABELS, STEP_ORDER } from './model';
import clsx from 'clsx';

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const SpinnerIcon = () => (
  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
);

const ErrorIcon = () => (
  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const InstallProgress = ({ progress }: { progress: ProgressState }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-sm w-full space-y-4">
        <div className="space-y-3">
          {STEP_ORDER.map((step, index) => {
            const isCompleted = progress.completedSteps.includes(step);
            const isCurrent = progress.currentStep === step;

            return (
              <div key={step} className="flex items-center space-x-3">
                <div
                  className={clsx(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300',
                    {
                      'bg-green-500 text-white': isCompleted,
                      'bg-blue-500 text-white': isCurrent && !isCompleted,
                      'bg-gray-700 text-gray-400': !isCompleted && !isCurrent,
                    },
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon />
                  ) : isCurrent ? (
                    <SpinnerIcon />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={clsx('text-sm transition-colors duration-300', {
                      'text-green-400': isCompleted,
                      'text-blue-400': isCurrent && !isCompleted,
                      'text-gray-400': !isCompleted && !isCurrent,
                    })}
                  >
                    {STEP_LABELS[step]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {progress.error && (
          <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <ErrorIcon />
              <div className="text-sm text-red-300">An error occurred</div>
            </div>
            <div className="text-xs text-red-200 mt-1">{progress.error}</div>
          </div>
        )}
      </div>
    </div>
  );
};
