import {Box, Text} from 'ink';
import type {ProcessEvent} from '../../events/index.js';
import {CardFrame} from '../CardFrame.js';
import {formatTimestamp} from '../format.js';
import {theme, type ThemeColor} from '../theme.js';

export interface ProcessCardProps {
  event: ProcessEvent;
  selected?: boolean;
}

const stateColor = (state: ProcessEvent['state']): ThemeColor => {
  switch (state) {
    case 'running':
      return theme.green;
    case 'stopping':
      return theme.orange;
    case 'exited':
      return theme.muted;
    default:
      return theme.blue;
  }
};

export const ProcessCard = ({event, selected = false}: ProcessCardProps) => (
  <CardFrame
    title={`Process ${event.state}`}
    accent={stateColor(event.state)}
    meta={formatTimestamp(event.timestamp)}
    selected={selected}
  >
    <Text color={theme.text}>{event.command}</Text>
    <Box gap={2} marginTop={1}>
      {event.pid !== undefined && <Text color={theme.muted}>pid {event.pid}</Text>}
      {event.exitCode !== undefined && (
        <Text color={event.exitCode === 0 ? theme.green : theme.red}>
          exit {event.exitCode ?? '—'}
        </Text>
      )}
      {event.signal !== undefined && event.signal !== null && (
        <Text color={theme.orange}>{event.signal}</Text>
      )}
    </Box>
  </CardFrame>
);
