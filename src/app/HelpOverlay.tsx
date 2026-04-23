import {Box, Text} from 'ink';
import {theme} from '../ui/index.js';

const shortcuts: readonly [string, string][] = [
  ['↑ / k', 'select the previous event'],
  ['↓ / j', 'select the next event'],
  ['g / G', 'jump to the first event / follow the latest event'],
  ['enter', 'expand or collapse the selected card'],
  ['1–6', 'toggle HTTP, JSON, error, warning, process, and text events'],
  ['/', 'filter the visible feed by text'],
  ['r', 'switch between cards and raw output'],
  ['p', 'pause or resume the visible feed'],
  ['c', 'clear event history'],
  ['q', 'stop the command and exit'],
  ['?', 'open or close this help'],
];

export const HelpOverlay = () => (
  <Box borderStyle="double" borderColor={theme.blue} flexDirection="column" paddingX={2}>
    <Text bold color={theme.text}>
      Relay Cards controls
    </Text>
    <Box flexDirection="column" marginTop={1}>
      {shortcuts.map(([key, description]) => (
        <Box key={key} gap={2}>
          <Box width={12}>
            <Text color={theme.orange}>{key}</Text>
          </Box>
          <Text color={theme.muted}>{description}</Text>
        </Box>
      ))}
    </Box>
  </Box>
);
