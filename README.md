# Tutor

A Claude Code mod that adds a sidebar tutor. It watches what Claude is doing
(your prompt, each tool call, the final answer) and writes short cards that
explain the concepts and the decisions behind the work, each with a quick
check-yourself question.

- Cards stack in a scrolling feed, and each new one scrolls into view
- Each quick check is multiple choice, graded as you tap, with a running score
- It paces itself to you: answer a quick check and the next card follows soon
  after; leave them unanswered and it waits
- A text box to ask the tutor anything (or type `simpler` / `deeper`)
- A little Claude pet trots along the bottom; press it (or type `nap` /
  `wake`) to pause and resume new cards

It runs on Claude Code's own model access (Haiku), so it needs no API key.

## Install

In a terminal `claude` session:

```
/plugin install tutor --marketplace MkGut/claude-tutor
```

Answer `y` to add the marketplace, then pick the user scope. Installed at the
user scope it also loads in the desktop app's Code tab. Open the sidebar with
`/tutor` if it is not already showing.

## Develop

```
claude plugin validate .
claude plugin test .
```

Pacing, card length and the teaching level are constants at the top of
`hooks/register.tsx`.
