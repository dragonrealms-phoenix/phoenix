# GitHub Copilot Test Instructions

We use `vitest`.

Include the following import when creating a new file:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
```

The outermost `describe` should be named for the file being tested.
For example, if testing "game.parser.ts" then you would use `describe('game-parser')`.

The inner sibling `describe` blocks should be named after the public methods from the class being tested.
For example, if the class has the public method "getData" then you would use `describe('#getData')`.

The outermost `describe` should include the `beforeEach` and `afterEach` functions.

Within the inner `describe` blocks, use the `it` function to define the tests.
Name the tests using either the `it should {action} when {condition}` or `it {imperative}` formats.
For example, `it('should skip when log level is not enabled')` or `it('emits event to all subscribers')`.

The function argument passed to the `describe` blocks should be synchronous, `() => {}`.

The function argument passed to the `it` blocks should be asynchronous, `async () => {}`.
