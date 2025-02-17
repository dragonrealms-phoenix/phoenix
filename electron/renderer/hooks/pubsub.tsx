import { useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Logger } from '../../common/logger/types.js';
import { runInBackground } from '../lib/async/run-in-background.js';
import { getScopedLogger } from '../lib/logger/logger.factory.js';
import type { PubSubData } from '../types/pubsub.types.js';

export type PubSubSubscribeCallback<T = unknown> = (
  data: T
) => Promise<void> | void;

export type PubSubUnsubscribeCallback = () => void;

export type PubSubSubscriber<T extends string = string> =
  T extends 'game:connect'
    ? PubSubSubscribeCallback<PubSubData.GameConnect>
    : T extends 'game:disconnect'
      ? PubSubSubscribeCallback<PubSubData.GameDisconnect>
      : T extends 'game:event'
        ? PubSubSubscribeCallback<PubSubData.GameEvent>
        : T extends 'game:command'
          ? PubSubSubscribeCallback<PubSubData.GameCommand>
          : T extends 'game:error'
            ? PubSubSubscribeCallback<PubSubData.GameError>
            : T extends 'sidebar:show'
              ? PubSubSubscribeCallback<PubSubData.SidebarShow>
              : T extends 'toast:add'
                ? PubSubSubscribeCallback<PubSubData.ToastAdd>
                : T extends 'character:play:starting'
                  ? PubSubSubscribeCallback<PubSubData.CharacterPlayStarting>
                  : T extends 'character:play:started'
                    ? PubSubSubscribeCallback<PubSubData.CharacterPlayStarted>
                    : T extends 'character:play:stopping'
                      ? PubSubSubscribeCallback<PubSubData.CharacterPlayStopping>
                      : T extends 'character:play:stopped'
                        ? PubSubSubscribeCallback<PubSubData.CharacterPlayStopped>
                        : T extends 'layout:load'
                          ? PubSubSubscribeCallback<PubSubData.LayoutLoad>
                          : T extends 'layout:item:closed'
                            ? PubSubSubscribeCallback<PubSubData.LayoutItemClosed>
                            : T extends 'layout:item:moved'
                              ? PubSubSubscribeCallback<PubSubData.LayoutItemMoved>
                              : PubSubSubscribeCallback;

type PubSubSubscriberDataArg<T extends string = string> = Parameters<
  PubSubSubscriber<T>
>[0];

interface PubSubSubscribersByEventType<T extends string = string> {
  [event: string]: Array<PubSubSubscriber<T>>;
}

/**
 * This interface is designed to be simple.
 * The methods accept two arguments: an event (string) and a subscriber (function).
 * They deviate from the convention of named arguments in the interest
 * of simplicity and brevity.
 */
export interface PubSub {
  /**
   * Subscribes to an event.
   * Returns a method that will unsubscribe from the event.
   * Or, you can explicitly call `unsubscribe(event, subscriber)`.
   * For automatic unsubscription, use `useSubscribe` hook.
   */
  subscribe: <T extends string = string>(
    event: T,
    subscriber: PubSubSubscriber<T>
  ) => PubSubUnsubscribeCallback;

  /**
   * Unsubscribe from an event.
   */
  unsubscribe: <T extends string = string>(
    event: T,
    subscriber: PubSubSubscriber<T>
  ) => void;

  /**
   * Publish a message to all subscribers of the event.
   */
  publish: <T extends string = string>(
    event: T,
    data?: PubSubSubscriberDataArg<T>
  ) => void;
}

/**
 * Hook that subscribes to an event.
 * Automatically unsubscribes when the component unmounts.
 *
 * For more granular control, use `usePubSub()`.
 */
export const useSubscribe = <T extends string = string>(
  event: T,
  subscriber: PubSubSubscriber<T>
): void => {
  const subscribe = usePubSubStore(
    useShallow((state) => {
      return state.subscribe;
    })
  );

  useEffect(() => {
    const unsubscribe = subscribe({ event, subscriber });
    return () => {
      unsubscribe();
    };
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
    // We exclude other props so that we don't re-render when they change.
    useShallow((state) => {
      return {
        subscribe: state.subscribe,
        unsubscribe: state.unsubscribe,
        publish: state.publish,
      };
    })
  );

  // I'm not sure if this is necessary since we use a shallow store above,
  // but I'm going to memoize the return value just in case.
  const pubsub = useMemo((): PubSub => {
    return {
      subscribe: <T extends string = string>(
        event: T,
        subscriber: PubSubSubscriber<T>
      ) => {
        return store.subscribe({ event, subscriber });
      },

      unsubscribe: <T extends string = string>(
        event: T,
        subscriber: PubSubSubscriber<T>
      ) => {
        store.unsubscribe({ event, subscriber });
      },

      publish: <T extends string = string>(
        event: T,
        data: PubSubSubscriberDataArg<T>
      ) => {
        store.publish({ event, data });
      },
    };
  }, [store]);

  return pubsub;
};

interface PubSubStoreData {
  /**
   * Private logger for the pubsub store.
   */
  logger: Logger;

  /**
   * Map of event names to subscribers.
   */
  subscribers: PubSubSubscribersByEventType;

  /**
   * Subscribes to an event.
   * Returns a method that will unsubscribe from the event.
   * Or, you can explicitly call `unsubscribe(event, subscriber)`.
   */
  subscribe: <T extends string = string>(options: {
    event: T;
    subscriber: PubSubSubscriber<T>;
  }) => PubSubUnsubscribeCallback;

  /**
   * Unsubscribe from an event.
   */
  unsubscribe: <T extends string = string>(options: {
    event: T;
    subscriber: PubSubSubscriber<T>;
  }) => void;

  /**
   * Publish a message to all subscribers of the event.
   */
  publish: <T extends string = string>(options: {
    event: T;
    data: PubSubSubscriberDataArg<T>;
  }) => void;
}

/**
 * An implementation of the PubSub pattern.
 */
const usePubSubStore = create<PubSubStoreData>((set, get) => ({
  logger: getScopedLogger('hooks:pubsub'),

  subscribers: {},

  subscribe: <T extends string = string>(options: {
    event: T;
    subscriber: PubSubSubscriber<T>;
  }) => {
    const { event, subscriber } = options;

    set((state: PubSubStoreData) => {
      const subscribers = state.subscribers[event] ?? [];

      const updatedSubscribers = [
        ...subscribers,
        subscriber as PubSubSubscribeCallback,
      ];

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

  unsubscribe: <T extends string = string>(options: {
    event: T;
    subscriber: PubSubSubscriber<T>;
  }) => {
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

  publish: <T extends string = string>(options: {
    event: T;
    data: PubSubSubscriberDataArg<T>;
  }) => {
    const { event, data } = options;

    const state = get();
    const subscribers = state.subscribers[event] ?? [];

    // Optmistically run all subscribers simultaneously
    // so that a slow subscriber doesn't block the others.
    runInBackground(async () => {
      await Promise.allSettled(
        subscribers.map(async (subscriber) => {
          try {
            await subscriber(data);
          } catch (error) {
            get().logger.error('error in pubsub subscriber', {
              event,
              error,
            });
          }
        })
      );
    });
  },
}));
