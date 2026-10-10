import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveAlertStatus } from './active-alert-status';

describe('ActiveAlertStatus', () => {
  let component: ActiveAlertStatus;
  let fixture: ComponentFixture<ActiveAlertStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveAlertStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveAlertStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
