import type * as rxjs from 'rxjs';
import { ReplayFirstSubscriberOnlySubject } from '../replay-first-subscriber-only.subject';

describe('ReplayFirstSubscriberOnlySubject', () => {
  let subscriber1NextSpy: jest.Mock;
  let subscriber2NextSpy: jest.Mock;

  let subscriber1ErrorSpy: jest.Mock;
  let subscriber2ErrorSpy: jest.Mock;

  let subscriber1CompleteSpy: jest.Mock;
  let subscriber2CompleteSpy: jest.Mock;

  let subject: rxjs.SubjectLike<string>;

  beforeEach(() => {
    subject = new ReplayFirstSubscriberOnlySubject<string>();

    subscriber1NextSpy = jest.fn();
    subscriber2NextSpy = jest.fn();

    subscriber1ErrorSpy = jest.fn();
    subscriber2ErrorSpy = jest.fn();

    subscriber1CompleteSpy = jest.fn();
    subscriber2CompleteSpy = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should replay buffered events to the first subscriber only', () => {
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

  it('should emit error to the first subscriber only', () => {
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

  it('should emit error to all subscribers', () => {
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
