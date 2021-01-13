import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RateDeliveryComponent } from './rate-delivery.component';

describe('RateDeliveryComponent', () => {
  let component: RateDeliveryComponent;
  let fixture: ComponentFixture<RateDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RateDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RateDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
