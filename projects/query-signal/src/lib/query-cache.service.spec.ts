import { TestBed } from '@angular/core/testing';

import { QueryCacheService } from './query-cache.service';

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
