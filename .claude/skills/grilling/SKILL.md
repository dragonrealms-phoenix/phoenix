---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
source: https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling (modified)
license: MIT (c) 2026 Matt Pocock
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the frontier in one round, recommend an answer for each, then wait for the user's answers before the next round.

## Asking a round

Ask each round with the AskUserQuestion tool.

- **One question per decision.** The tool takes at most four per call.
- **When the frontier holds more than four, ask the four that unblock the most.** The rest open the next round.
- **Put the context in the question text.** Say what you found that makes this decision matter.
- **Make your recommendation the first option.** End its label with "(Recommended)" and give the reason in its description.
- **Say what each option costs or rules out**, in its description. A label alone doesn't let the user choose.
- **Give options even when the question is open.** Offer the two or three likeliest answers. The tool adds a free-text "Other" for anything else.
- **Use `preview` when the options are concrete artifacts**, such as code, config or a layout. It works on single-select questions only.

When the context needs more than a few sentences, write it as text first, then call the tool.

If the AskUserQuestion tool isn't available, ask in text:

```
❓ **Q1** - **<question title>**: <the context, then the question>

- **A.** <option>: <what it costs>
- **B.** <option>: <what it costs>

➡️ **<letter>**: <why, in one line>
```

## Facts and decisions

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (the repo, the git history, package configs, tools, the web), go find it; dispatch a sub-agent when the search is wide. Don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

A fact the user would know from experience, such as "has this happened before", is still yours to look for first. Check where it would be recorded: the issue tracker, error reports, logs. Ask only for what those don't hold.

## Finishing

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Close by listing every settled decision, one line each, and ask the user to confirm the list. Do not act on it until they do.
