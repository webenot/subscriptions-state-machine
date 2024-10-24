// eslint-disable-next-line @typescript-eslint/naming-convention
export function BaseEventHandlerDecorator(metadataKey: string, eventType: string): MethodDecorator {
  return function (target: object, propertyKey: string | symbol): void {
    // First, it attempts to retrieve any existing handlers stored in the metadata of the class.
    const handlers = Reflect.getMetadata(metadataKey, target.constructor) || [];

    // It then adds the current handler to the array of handlers. Each handler is an object
    // that contains the eventType and the methodName (the name of the method decorated by this decorator).
    handlers.push({
      eventType,
      methodName: propertyKey,
    });

    // Finally, it redefines the metadata for the class, updating the list of handlers.
    // This metadata is associated with the class (not instances of the class), allowing these handlers
    // to be retrieved and utilized elsewhere in the application,
    // such as when processing incoming Stripe webhook events.
    Reflect.defineMetadata(metadataKey, handlers, target.constructor);
  };
}
