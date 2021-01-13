import { TestBed } from '@angular/core/testing';

import { RateDeliveryService } from './rate-delivery.service';

describe('RateDeliveryService', () => {
  let service: RateDeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RateDeliveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
