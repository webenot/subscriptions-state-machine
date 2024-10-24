// eslint-disable-next-line @typescript-eslint/naming-convention
export function StateMachineEventHandler(metadataKey: string, states: string[], eventType: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    const handlers = Reflect.getMetadata(metadataKey, target.constructor) || {};

    for (const state of states) {
      // eslint-disable-next-line security/detect-object-injection
      if (handlers[state]) {
        // eslint-disable-next-line security/detect-object-injection
        handlers[state][eventType] = propertyKey;
      } else {
        // eslint-disable-next-line security/detect-object-injection
        handlers[state] = {
          [eventType]: propertyKey,
        };
      }
    }

    Reflect.defineMetadata(metadataKey, handlers, target.constructor);
  };
}
