# Glossary Format

## Area glossary: `.claude/glossary/<area>.md`

```md
# {Area Name}

{One or two sentence description of what this area is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account
```

## Rules

- **Be opinionated.** When multiple words exist for the same concept, pick the best one and list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences max. Define what it IS, not what it does.
- **Only include terms specific to this project's context.** General programming concepts (timeouts, error types, utility patterns) don't belong even if the project uses them extensively. Before adding a term, ask: is this a concept unique to this context, or a general programming concept? Only the former belongs.
- **Group terms under subheadings** when natural clusters emerge. If all terms belong to a single cohesive area, a flat list is fine.

## Map: `.claude/glossary/GLOSSARY-MAP.md`

The map lists the areas, links their glossaries, and says how they relate. It is the only glossary file loaded into every session, so keep it short.

```md
# Glossary Map

## Areas

- [Ordering](./ordering.md): receives and tracks customer orders
- [Billing](./billing.md): generates invoices and processes payments
- [Fulfillment](./fulfillment.md): manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

When the current topic's area is unclear, ask.
