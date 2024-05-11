import useSize from '@react-hook/size';
import { useGate } from 'effector-react';
import { useRef } from 'react';
import { TerminalModel } from './model';
import './terminal.scss';

import 'xterm/css/xterm.css';

interface TerminalUIProps {
  model: TerminalModel;
}

export const TerminalPanel = ({ model }: TerminalUIProps) => {
  const xtermRef = useRef<HTMLDivElement | null>(null);
  const size = useSize(xtermRef);

  useGate(model.TerminalGate, { xtermRef, elementSize: size });

  return <div ref={xtermRef} style={{ width: '100%', height: '100%' }}></div>;
};
