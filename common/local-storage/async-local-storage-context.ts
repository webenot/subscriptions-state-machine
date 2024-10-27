import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes } from 'crypto';

export interface IAsyncLocalStorageContext {
  traceId: string;
  startTime: [number, number];
  userId?: string | undefined;
  clientDeviceId?: string | undefined;
  messageId?: string;
}

export const asyncLocalStorage = new AsyncLocalStorage<IAsyncLocalStorageContext>();

export function setAsyncLocalStorageContextForHttpRequest(data: {
  traceId?: string;
  userId?: string;
  clientDeviceId?: string;
}): IAsyncLocalStorageContext {
  const context = {
    traceId: data.traceId || generateTraceId(),
    startTime: process.hrtime(),
    userId: data.userId,
    clientDeviceId: data.clientDeviceId,
  };
  asyncLocalStorage.enterWith(context);
  return context;
}

export function setAsyncLocalStorageContextForSQSMessages(data: {
  messageId: string | undefined;
  userId?: string;
  clientDeviceId?: string;
}): IAsyncLocalStorageContext {
  const context = {
    traceId: data.messageId || generateTraceId(),
    startTime: process.hrtime(),
    userId: data.userId,
    clientDeviceId: data.clientDeviceId,
  };
  asyncLocalStorage.enterWith(context);
  return context;
}

export function getAsyncLocalStorageContext(): IAsyncLocalStorageContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * return seconds
 */
export function getDurationFromStart(): number {
  const diff = process.hrtime(getAsyncLocalStorageContext()?.startTime);
  return +(diff[0] + diff[1] * 1e-9).toFixed(6);
}

function generateTraceId(): string {
  return randomBytes(16).toString('hex');
}
