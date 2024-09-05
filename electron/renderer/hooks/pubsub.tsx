import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { runInBackground } from '../lib/async/run-in-background.js';

export type PubSubSubscriber = (data?: any) => Promise<void> | void;

export type PubSubUnsubscribeCallback = () => void;

/**
 * This interface is designed to be simple.
 * The methods accept two arguments: an event (string) and a subscriber (function).
 * They deviate from the convention of named arguments in the interest
 * of simplicity and brevity.
 */
interface PubSub {
  /**
   * Subscribes to an event.
   * Returns a method that will unsubscribe from the event.
   * Or, you can explicitly call `unsubscribe(event, subscriber)`.
   */
  subscribe: (
    event: string,
    subscriber: PubSubSubscriber
  ) => PubSubUnsubscribeCallback;

  /**
   * Unsubscribe from an event.
   */
  unsubscribe: (event: string, subscriber: PubSubSubscriber) => void;

  /**
   * Publish a message to all subscribers of the event.
   */
  publish: (event: string, data?: any) => void;
}

/**
 * Hook that subscribes to an event.
 * Automatically unsubscribes when the component unmounts.
 *
 * For more granular control, use `usePubSub()`.
 */
let counter = 0;
export const useSubscribe = (
  event: string,
  subscriber: PubSubSubscriber
): void => {
  counter += 1;
  console.log('useSubscribe', counter);

  const subscribe = usePubSubStore((state) => state.subscribe);

  useEffect(() => {
    return subscribe({ event, subscriber });
  }, [event, subscriber, subscribe]);
};

/**
 * Hook that provides functions for
 * subscribing, unsubscribing, and publishing events.
 *
 * The `subscribe` function returns a function that unsubscribes from the event.
 * It is your responsibility to unsubscribe when the component unmounts.
 * For automatic unsubscription, use `useSubscribe` hook.
 */
export const usePubSub = (): PubSub => {
  const store = usePubSubStore(
    // Technically, our state reducer is returning a new object
    // each time although the properties are the same.
    // Use the `useShallow` operator to prevent unnecessary re-renders.
    useShallow((state) => {
      return {
        // We exclude other properties like `subscribers`
        // so that we don't re-render when they change.
        // Who is subscribed or not is now relevant to this API shape.
        subscribe: state.subscribe,
        unsubscribe: state.unsubscribe,
        publish: state.publish,
      };
    })
  );

  const pubsub = useMemo(() => {
    return {
      subscribe: (event: string, subscriber: PubSubSubscriber) => {
        return store.subscribe({ event, subscriber });
      },
      unsubscribe: (event: string, subscriber: PubSubSubscriber) => {
        store.unsubscribe({ event, subscriber });
      },
      publish: (event: string, data?: any) => {
        store.publish({ event, data });
      },
    };
  }, [store]);

  return pubsub;
};

interface PubSubStoreData {
  /**
   * Map of event names to subscribers.
   */
  subscribers: Record<string, Array<PubSubSubscriber>>;

  /**
   * Subscribes to an event.
   * Returns a method that will unsubscribe from the event.
   * Or, you can explicitly call `unsubscribe(event, subscriber)`.
   */
  subscribe: (options: {
    event: string;
    subscriber: PubSubSubscriber;
  }) => PubSubUnsubscribeCallback;

  /**
   * Unsubscribe from an event.
   */
  unsubscribe: (options: {
    event: string;
    subscriber: PubSubSubscriber;
  }) => void;

  /**
   * Publish a message to all subscribers of the event.
   */
  publish: (options: { event: string; data?: any }) => void;
}

/**
 * An implementation of the PubSub pattern.
 */
const usePubSubStore = create<PubSubStoreData>((set, get) => ({
  subscribers: {},

  subscribe: (options: { event: string; subscriber: PubSubSubscriber }) => {
    const { event, subscriber } = options;

    set((state: PubSubStoreData) => {
      const subscribers = state.subscribers[event] ?? [];

      const updatedSubscribers = [...subscribers, subscriber];

      return {
        subscribers: {
          ...state.subscribers,
          [event]: updatedSubscribers,
        },
      };
    });

    const unsub: PubSubUnsubscribeCallback = () => {
      // Get the current state and unsubscribe without causing a re-render.
      // This also lets us reuse the same unsubscribe logic.
      get().unsubscribe({ event, subscriber });
    };

    return unsub;
  },

  unsubscribe: (options: { event: string; subscriber: PubSubSubscriber }) => {
    const { event, subscriber } = options;

    set((state: PubSubStoreData) => {
      const subscribers = state.subscribers[event] ?? [];

      const updatedSubscribers = subscribers.filter((sub) => {
        return sub !== subscriber;
      });

      return {
        subscribers: {
          ...state.subscribers,
          [event]: updatedSubscribers,
        },
      };
    });
  },

  publish: (options: { event: string; data?: any }) => {
    const { event, data } = options;

    const state = get();
    const subscribers = state.subscribers[event] ?? [];

    // Optmistically run all subscribers simultaneously
    // so that a slow subscriber doesn't block the others.
    runInBackground(async () => {
      await Promise.allSettled(
        subscribers.map((subscriber) => {
          return subscriber(data);
        })
      );
    });
  },
}));
