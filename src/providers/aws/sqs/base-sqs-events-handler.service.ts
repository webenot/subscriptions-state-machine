import type { LoggerService } from '~/logger/logger.service';

export abstract class BaseSqsEventsHandlerService {
  private readonly key: string;
  protected readonly logger: LoggerService;

  protected constructor(key: string, logger: LoggerService) {
    this.key = key;
    this.logger = logger;
  }

  onModuleInit(): void {
    const handlers = Reflect.getMetadata(this.key, this.constructor) || [];
    this.logger.info(`Service initialized with ${handlers.length} handlers`);
  }

  public async handleEvent<TEventType extends string, TEvent extends { type: TEventType }>(
    event: TEvent
  ): Promise<void> {
    const eventHandler = this.getEventHandler(event.type);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (eventHandler && typeof this[eventHandler.methodName] === 'function') await this[eventHandler.methodName](event);
  }

  protected getEventHandler<TEventType extends string, TEventHandler extends { eventType: TEventType }>(
    eventType: string
  ): TEventHandler {
    const eventHandlers: TEventHandler[] = Reflect.getMetadata(this.key, this.constructor) || [];

    const eventHandler = eventHandlers.find((handler) => handler.eventType === eventType);
    if (!eventHandler) {
      const errorMessage = `No handler registered for event type [${eventType}]`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return eventHandler;
  }
}
