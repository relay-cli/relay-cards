import {spawnSync, type ChildProcess} from 'node:child_process';

const forwardedSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGHUP'];

export interface SignalForwardingOptions {
  onSignal?: (signal: NodeJS.Signals) => void;
}

export const terminateProcess = (
  child: ChildProcess,
  signal: NodeJS.Signals = 'SIGTERM',
): boolean => {
  if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) {
    return false;
  }

  if (process.platform === 'win32') {
    const result = spawnSync('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], {
      windowsHide: true,
      stdio: 'ignore',
    });
    return result.status === 0 || child.kill(signal);
  }

  return child.kill(signal);
};

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
      terminateProcess(child, signal);
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
