import type {ChildProcess} from 'node:child_process';

const forwardedSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];

export interface SignalForwardingOptions {
  onSignal?: (signal: NodeJS.Signals) => void;
}

export const forwardProcessSignals = (
  child: ChildProcess,
  options: SignalForwardingOptions = {},
): (() => void) => {
  let forwarded = false;
  const handlers = new Map<NodeJS.Signals, () => void>();

  for (const signal of forwardedSignals) {
    const handler = (): void => {
      if (forwarded || child.exitCode !== null || child.signalCode !== null) {
        return;
      }
      forwarded = true;
      options.onSignal?.(signal);
      child.kill(signal);
    };
    handlers.set(signal, handler);
    process.on(signal, handler);
  }

  return () => {
    for (const [signal, handler] of handlers) {
      process.off(signal, handler);
    }
  };
};
