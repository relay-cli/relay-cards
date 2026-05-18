# Contributing

Relay Cards is developed in small, reviewable changes. Bug reports, parser examples, accessibility improvements, and new card types are welcome.

## Local setup

```sh
npm install
npm run demo
```

Before opening a pull request, run:

```sh
npm run check
```

## Parser changes

Include the original log shape in a test. A parser must leave unmatched input available to the text fallback, and malformed input must not terminate the process.

## Interface changes

Check the result at narrow and wide terminal widths. Keep important information readable without color, and preserve the raw-output view for details that do not fit a card.

## Commit messages

Use a short action-oriented subject such as `feat: recognize Caddy access logs` or `fix: preserve child exit status`.
