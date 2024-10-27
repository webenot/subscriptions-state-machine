export type StateMachineEvent<TEvent, TData> = {
  type: TEvent;
  data: TData;
};
