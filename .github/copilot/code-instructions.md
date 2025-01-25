# GitHub Copilot Code Instructions

Arrow functions that return a JSON object should always use a block with a `return` statment.

Examples:

```ts
// Good
() => {
  return {
    some: 'data',
  };
};

// Bad
() => ({ some: 'data' });
```
