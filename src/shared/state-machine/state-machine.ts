import { ForbiddenStateMachineActionException } from './exceptions';
import type { StateMachineEvent, StateMachineState } from './types';

export class StateMachine<TState extends string, TData> {
  public readonly currentState: StateMachineState<TState, TData>;
  private readonly metadataKey: string;

  constructor(metadataKey: string, currentState: StateMachineState<TState, TData>) {
    this.metadataKey = metadataKey;
    this.currentState = currentState;
  }

  async transitionTo<TEvent, TEventData extends object, TReturn, TClass extends NonNullable<unknown>>(
    event: StateMachineEvent<TEvent, TEventData>,
    target: TClass
  ): Promise<TReturn> {
    const eventHandlers = Reflect.getMetadata(this.metadataKey, target.constructor) || {};
    const handlerName: string | undefined = eventHandlers[this.currentState.state]?.[event.type] as string;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line security/detect-object-injection
    if (handlerName && typeof target[handlerName] === 'function') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line max-len
      // eslint-disable-next-line security/detect-object-injection,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return await target[handlerName](this.currentState, event.data);
    }

    throw new ForbiddenStateMachineActionException(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Not allowed event [${event.type}] for current state [${this.currentState.state}]`
    );
  }
}
