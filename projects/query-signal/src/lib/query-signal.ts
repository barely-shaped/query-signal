import {
  Signal,
  effect,
  signal,
  computed,
  inject,
  untracked,
} from '@angular/core';
import { QueryCacheService } from './query-cache.service';

export interface QuerySignal<T> extends Signal<T> {
  isError: Signal<boolean>;
  isSuccess: Signal<boolean>;
  isIdle: Signal<boolean>;
  isLoading: Signal<boolean>;
  isFetching: Signal<boolean>;
  dataUpdatedAt: Signal<number>;
  refetch: () => void;
}

export enum QueryStatus {
  Idle,
  Loading,
  Error,
  Success,
}

const createArguments = <Args extends any[]>(args: {
  [K in keyof Args]: Signal<Args[K]>;
}): Signal<Args> => computed(() => [...args.map((sig) => sig())] as Args);

interface QuerySignalOptions<
  Data,
  QueryFn extends (...args: unknown[]) => Data | Promise<Data>,
  Args extends Parameters<QueryFn>,
> {
  queryFn: (...args: Args) => Data | Promise<Data>;
  initialValue: Data;
  queryParams: { [K in keyof Args]: Signal<Args[K]> };
  queryKey?: string;
}

export const querySignal = <
  Data,
  QueryFn extends (...args: unknown[]) => Data | Promise<Data>,
  Args extends Parameters<QueryFn>,
>({
  queryFn,
  initialValue,
  queryParams,
  queryKey = queryFn.name,
}: QuerySignalOptions<Data, QueryFn, Args>): QuerySignal<Data> => {
  const cacheService = inject(QueryCacheService);
  const queryFnParams = createArguments(queryParams);
  const internalData = signal(cacheService.get(queryFn.name) ?? initialValue);
  const status = signal(QueryStatus.Idle);
  const isFetching = signal(false);
  const dataUpdatedAt = signal<number>(0);
  const error = signal<Error | undefined>(void 0);
  const isIdle = computed(() => status() === QueryStatus.Idle);
  const isLoading = computed(() => status() === QueryStatus.Loading);
  const isError = computed(() => status() === QueryStatus.Error);
  const isSuccess = computed(() => status() === QueryStatus.Success);
  const cacheKey = computed((): string => {
    if (queryFnParams()['length'] === 0) {
      return queryKey;
    }
    return queryFnParams()['reduce'](
      (acc: string, next: unknown) => `${acc}.${JSON.stringify(next)}`,
      queryKey,
    );
  });

  const fetch = async (args: Args) => {
    error.set(void 0);
    dataUpdatedAt() === 0 && status.set(QueryStatus.Loading);
    isFetching.set(true);

    try {
      const response = await queryFn(...args);

      cacheService.set(cacheKey(), response);
      internalData.set(response);
      status.set(QueryStatus.Success);
      dataUpdatedAt.set(Date.now());
    } catch (e: any) {
      error.set(e);
      status.set(QueryStatus.Error);
    } finally {
      isFetching.set(false);
    }
  };

  const refetch = () => {
    fetch(queryFnParams());
  };

  effect(
    () => {
      const queryParams = queryFnParams();
      untracked(() => {
        fetch(queryParams);
      });
    },
    { allowSignalWrites: true },
  );

  return computed(() =>
    Object.assign(internalData.asReadonly(), {
      refetch,
      isError,
      isLoading,
      isSuccess,
      isIdle,
      isFetching,
      dataUpdatedAt,
    }),
  )();
};
