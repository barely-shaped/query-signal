import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueryCacheService {
  private readonly cache = new Map<string | string[], any>();

  constructor() {}

  set(key: string | string[], value: any) {
    this.cache.set(key, value);
  }

  get(key: string | string[]) {
    return this.cache.get(key);
  }
}
