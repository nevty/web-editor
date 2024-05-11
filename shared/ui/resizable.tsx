import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '../lib';

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className,
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle>) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-[2px] items-center justify-center bg-slate-200 dark:bg-slate-800',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-300 focus-visible:ring-offset-1',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
      'data-[panel-group-direction=vertical]:h-[2px] data-[panel-group-direction=vertical]:w-full',
      'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1',
      'data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2',
      'data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      'hover:bg-blue-500 hover:z-[1000] hover:opacity-75 hover:scale-[4] hover:transform hover:delay-300',
      'data-[resize-handle-state=drag]:bg-blue-500 data-[resize-handle-state=drag]:z-[1000] data-[resize-handle-state=drag]:opacity-75 data-[resize-handle-state=drag]:scale-[4] data-[resize-handle-state=drag]:transform hover:delay-300',
      className,
    )}
    {...props}
  ></ResizablePrimitive.PanelResizeHandle>
);

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
