import type {ReactNode} from 'react';
import {Box, Text} from 'ink';
import {theme, type ThemeColor} from './theme.js';

export interface CardFrameProps {
  title: string;
  accent?: ThemeColor;
  meta?: string;
  repeat?: number;
  selected?: boolean;
  children: ReactNode;
}

export const CardFrame = ({
  title,
  accent = theme.blue,
  meta,
  repeat = 1,
  selected = false,
  children,
}: CardFrameProps) => (
  <Box
    borderStyle="single"
    borderColor={selected ? accent : theme.rule}
    flexDirection="column"
    paddingX={1}
  >
    <Box justifyContent="space-between">
      <Box gap={1}>
        <Text color={accent}>■</Text>
        <Text bold color={theme.text}>
          {title}
        </Text>
        {repeat > 1 && <Text color={theme.muted}>×{repeat}</Text>}
      </Box>
      {meta !== undefined && <Text color={theme.muted}>{meta}</Text>}
    </Box>
    <Box marginTop={1} flexDirection="column">
      {children}
    </Box>
  </Box>
);
