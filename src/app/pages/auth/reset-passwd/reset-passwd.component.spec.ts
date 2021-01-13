import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswdComponent } from './reset-passwd.component';

describe('ResetPasswdComponent', () => {
  let component: ResetPasswdComponent;
  let fixture: ComponentFixture<ResetPasswdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetPasswdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
