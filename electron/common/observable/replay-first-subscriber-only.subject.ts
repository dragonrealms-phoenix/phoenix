import * as rxjs from 'rxjs';

/**
 * The maximum number of events to buffer to replay upon subscription.
 * Once this limit is reached, any new events are dropped until
 * the subject is subscribed to.
 */
const REPLAY_BUFFER_SIZE = 100;

/**
 * A custom `ReplaySubject` that only replays the buffered events
 * to the first subscriber. All subsequent subscribers will only
 * receive new events, as if subscribed to a `Subject`.
 * https://stackoverflow.com/a/69390202/470818
 */
export class ReplayFirstSubscriberOnlySubject<T>
  implements rxjs.SubjectLike<T>
{
  /**
   * Buffers events and replays them to the first subscriber.
   * Continues to emit new events.
   */
  private replaySubject: rxjs.Subject<T>;

  /**
   * Subject used for all subsequent subscribers.
   * They only receive new emits, not buffered events before subscribing.
   */
  private subject?: rxjs.Subject<T>;

  constructor() {
    this.replaySubject = new rxjs.ReplaySubject<T>(REPLAY_BUFFER_SIZE);
  }

  public next(value: T): void {
    // Notify the first subscriber of the value.
    this.replaySubject.next(value);
    // Notify all subsequent subscribers of the value.
    this.subject?.next(value);
  }

  public error(error: Error): void {
    // Notify the first subscriber of the error.
    this.replaySubject.error(error);
    // Notify all subsequent subscribers of the error.
    this.subject?.error(error);
  }

  public complete(): void {
    // Notify the first subscriber of the completion.
    this.replaySubject.complete();
    // Notify all subsequent subscribers of the completion.
    this.subject?.complete();
  }

  public subscribe(observer: Partial<rxjs.Observer<T>>): rxjs.Unsubscribable {
    const subscription = (this.subject ?? this.replaySubject).subscribe(
      observer
    );
    if (!this.subject) {
      this.subject = new rxjs.Subject<T>();
    }
    return subscription;
  }
}
