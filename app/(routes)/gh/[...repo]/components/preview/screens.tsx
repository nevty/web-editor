import { cn } from '@shared/lib';

export const ScreenNoServerRunning = () => (
  <ScreenWrapper>
    <div className="min-h-80 space-y-4">
      <h2 className="text-2xl font-bold">No server listening</h2>
      <ol className="text-sm">
        <li>
          Start a server from the terminal with{' '}
          <code className="bg-gray-800 text-white rounded-md p-1">
            npm run start/dev
          </code>
        </li>
      </ol>
    </div>
  </ScreenWrapper>
);

const ScreenWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex flex-col justify-center h-screen bg-gray-900 text-white p-4',
      className,
    )}
  >
    {children}
  </div>
);
