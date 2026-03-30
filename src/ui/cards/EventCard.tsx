import type {RelayEvent} from '../../events/index.js';
import {ErrorCard} from './ErrorCard.js';
import {HttpCard} from './HttpCard.js';
import {JsonCard} from './JsonCard.js';
import {ProcessCard} from './ProcessCard.js';
import {TextCard} from './TextCard.js';
import {WarningCard} from './WarningCard.js';

export interface EventCardProps {
  event: RelayEvent;
  expanded?: boolean;
  selected?: boolean;
}

export const EventCard = ({event, expanded = false, selected = false}: EventCardProps) => {
  switch (event.kind) {
    case 'http':
      return <HttpCard event={event} expanded={expanded} selected={selected} />;
    case 'json':
      return <JsonCard event={event} expanded={expanded} selected={selected} />;
    case 'error':
      return <ErrorCard event={event} expanded={expanded} selected={selected} />;
    case 'warning':
      return <WarningCard event={event} selected={selected} />;
    case 'process':
      return <ProcessCard event={event} selected={selected} />;
    case 'text':
      return <TextCard event={event} selected={selected} />;
  }
};
