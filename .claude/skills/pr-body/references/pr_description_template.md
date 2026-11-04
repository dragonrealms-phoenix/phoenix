### Dependencies

- {PR that must merge before this one, as `#number`. List them in merge order, bottom-up. Omit this whole section when nothing has to merge first.}

### Background

{One or two short sentences. First what was wrong or missing, then what is true once this PR ships. Plain words: no file, class or function names.}

### Changes

1. **{One thing this PR changes, in a few plain words.}** {Optional: one short sentence a reviewer needs, such as who it applies to or what stays the same.}
2. **{The next change. One item per thing the PR does, usually 1-4.}**

{Only when runtime behavior changes: a short lead line naming what the diagram shows, such as "How a game line reaches the highlight rules:"}

```mermaid
{One diagram of the new behavior: data flow, sequence or control flow. At most about 8 nodes, with real names and values. Solid arrows for what happens, dotted arrows for what is refused, ignored or skipped.}
```

{Only when runtime behavior changes: a short lead line, such as "One example per change:"}

|     | {Case: an input, or the state that decides it}           | Before                 | After              |
| --- | -------------------------------------------------------- | ---------------------- | ------------------ |
| 1   | {A concrete case for change 1, with real-looking values} | {What happened before} | {What happens now} |
| 2   | {...one row per numbered change, in the same order}      |                        |                    |

{Only when the PR changes what a user sees: a one-line lead, such as "The game window, before and after:", then the screenshots.}

| Before                                           | After                                          |
| ------------------------------------------------ | ---------------------------------------------- |
| ![{Before: what this image shows}](./before.png) | ![{After: what this image shows}](./after.png) |

Closes #{issue number. Only when an issue is known. Omit this line otherwise.}
