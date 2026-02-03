# Product scope

Relay Cards launches a command or reads standard input, converts recognizable output into structured events, and renders those events as an interactive terminal feed.

## First release

The first release covers:

- JSON and JSON Lines
- common and combined HTTP access logs
- errors and multiline stack traces
- warnings and ordinary text
- child-process lifecycle events
- interactive filtering, navigation, expansion, pause, raw view, and help
- bounded history and repeated-event grouping
- signal forwarding and child exit-code preservation
- plain output when the destination is not an interactive terminal

## Input contract

Every input line remains observable. Recognized lines become typed cards. Unrecognized or malformed values become text events. Multiline stack traces remain together.

## Operating contract

When Relay Cards launches a command, the command remains the primary workload. Relay Cards forwards termination signals, reports lifecycle events, and exits with the same status code.

## Initial card types

- HTTP request
- structured data
- error
- warning
- process event
- text message

## Deferred work

Adapters for individual logging libraries, remote log ingestion, persistent sessions, and multi-process aggregation can be added after the core interface has been exercised by real projects.
