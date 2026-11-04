---
name: domain-modeling
description: Build and sharpen Phoenix's domain model. Use when discussing codebase terminology, writing or editing a glossary in .claude/glossary/, or recording or editing a decision record in .claude/decisions/.
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling
license: MIT (c) 2026 Matt Pocock
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the _active_ discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely _reading_ the glossary for vocabulary is not this skill: that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## File structure

Phoenix has several domain areas, so the glossary is split per area and indexed by a map:

```
.claude/
├── glossary/
│   ├── GLOSSARY-MAP.md        ← lists the areas and how they relate
│   ├── connection.md          ← one glossary per area
│   └── game.md
└── decisions/
    ├── 0001-slug.md           ← decision records, numbered in order
    └── 0002-slug.md
```

Create files lazily: only when you have something to write. If an area has no glossary yet, create it when its first term is resolved and add it to `GLOSSARY-MAP.md`. If `.claude/decisions/` doesn't exist, create it when the first decision record is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in the glossary, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible. Which is right?"

### Update the glossary inline

When a term is resolved, update the area's glossary right there. Don't batch these up: capture them as they happen. Use the format in [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md).

Glossaries should be totally devoid of implementation details. Do not treat a glossary as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else. Mapping terms to code belongs in `.claude/rules/`.

### Offer decision records sparingly

Only offer to create a decision record when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the decision record. Use the format in [DECISION-FORMAT.md](./DECISION-FORMAT.md).
