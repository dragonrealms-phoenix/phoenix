import type * as rxjs from 'rxjs';
import type { Mock } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReplayFirstSubscriberOnlySubject } from '../replay-first-subscriber-only.subject.js';

describe('replay-first-subscriber-only-subject', () => {
  let subscriber1NextSpy: Mock;
  let subscriber2NextSpy: Mock;

  let subscriber1ErrorSpy: Mock;
  let subscriber2ErrorSpy: Mock;

  let subscriber1CompleteSpy: Mock;
  let subscriber2CompleteSpy: Mock;

  let subject: rxjs.SubjectLike<string>;

  beforeEach(() => {
    subject = new ReplayFirstSubscriberOnlySubject<string>();

    subscriber1NextSpy = vi.fn();
    subscriber2NextSpy = vi.fn();

    subscriber1ErrorSpy = vi.fn();
    subscriber2ErrorSpy = vi.fn();

    subscriber1CompleteSpy = vi.fn();
    subscriber2CompleteSpy = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('replays buffered events to the first subscriber only', () => {
    // buffer events for the first subscriber
    subject.next('A');
    subject.next('B');

    // first subscriber
    subject.subscribe({
      next: subscriber1NextSpy,
      error: subscriber1ErrorSpy,
      complete: subscriber1CompleteSpy,
    });

    // new event to all current subscribers
    subject.next('C');

    // second subscriber
    subject.subscribe({
      next: subscriber2NextSpy,
      error: subscriber2ErrorSpy,
      complete: subscriber2CompleteSpy,
    });

    // new event to all current subscribers
    subject.next('D');

    // done
    subject.complete();

    // First subscriber receives all buffered and new events.
    expect(subscriber1NextSpy).toHaveBeenCalledTimes(4);
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(1, 'A');
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(2, 'B');
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(3, 'C');
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(4, 'D');
    expect(subscriber1ErrorSpy).toHaveBeenCalledTimes(0);
    expect(subscriber1CompleteSpy).toHaveBeenCalledTimes(1);

    // Subsequent subscribers only receive new events.
    expect(subscriber2NextSpy).toHaveBeenCalledTimes(1);
    expect(subscriber2NextSpy).toHaveBeenNthCalledWith(1, 'D');
    expect(subscriber2ErrorSpy).toHaveBeenCalledTimes(0);
    expect(subscriber2CompleteSpy).toHaveBeenCalledTimes(1);
  });

  it('emits error to the first subscriber only', () => {
    // buffer events for the first subscriber
    subject.next('A');
    subject.error(new Error('test'));

    // first subscriber
    subject.subscribe({
      next: subscriber1NextSpy,
      error: subscriber1ErrorSpy,
      complete: subscriber1CompleteSpy,
    });

    // new event to all current subscribers
    subject.next('C');

    // second subscriber
    subject.subscribe({
      next: subscriber2NextSpy,
      error: subscriber2ErrorSpy,
      complete: subscriber2CompleteSpy,
    });

    // new event to all current subscribers
    subject.next('D');

    // done
    subject.complete();

    // First subscriber receives all buffered events then errors.
    expect(subscriber1NextSpy).toHaveBeenCalledTimes(1);
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(1, 'A');
    expect(subscriber1ErrorSpy).toHaveBeenCalledTimes(1);
    expect(subscriber1CompleteSpy).toHaveBeenCalledTimes(0);

    // Subsequent subscribers only receive new events.
    expect(subscriber2NextSpy).toHaveBeenCalledTimes(1);
    expect(subscriber2NextSpy).toHaveBeenNthCalledWith(1, 'D');
    expect(subscriber2ErrorSpy).toHaveBeenCalledTimes(0);
    expect(subscriber2CompleteSpy).toHaveBeenCalledTimes(1);
  });

  it('emits error to all subscribers', () => {
    // buffer events for the first subscriber
    subject.next('A');
    subject.next('B');

    // first subscriber
    subject.subscribe({
      next: subscriber1NextSpy,
      error: subscriber1ErrorSpy,
      complete: subscriber1CompleteSpy,
    });

    // new event to all current subscribers
    subject.next('C');

    // second subscriber
    subject.subscribe({
      next: subscriber2NextSpy,
      error: subscriber2ErrorSpy,
      complete: subscriber2CompleteSpy,
    });

    // new event to all current subscribers
    subject.error(new Error('test'));
    subject.next('D'); // no subscriber will receive this because of the error

    // done
    subject.complete();

    // First subscriber receives all buffered and new events.
    expect(subscriber1NextSpy).toHaveBeenCalledTimes(3);
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(1, 'A');
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(2, 'B');
    expect(subscriber1NextSpy).toHaveBeenNthCalledWith(3, 'C');
    expect(subscriber1ErrorSpy).toHaveBeenCalledTimes(1);
    expect(subscriber1CompleteSpy).toHaveBeenCalledTimes(0);

    // Subsequent subscribers only receive new events.
    expect(subscriber2NextSpy).toHaveBeenCalledTimes(0);
    expect(subscriber2ErrorSpy).toHaveBeenCalledTimes(1);
    expect(subscriber2CompleteSpy).toHaveBeenCalledTimes(0);
  });
});
