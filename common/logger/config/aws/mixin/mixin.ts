import { getAsyncLocalStorageContext } from '../../../../local-storage';
import type { IMixin } from '../../../types';

export const awsMixin: IMixin = (): Record<string, unknown> => {
  const requestContext = getAsyncLocalStorageContext();
  return {
    userId: requestContext?.userId,
    traceId: requestContext?.traceId,
    clientDeviceId: requestContext?.clientDeviceId,
    messageId: requestContext?.messageId,
  };
};
