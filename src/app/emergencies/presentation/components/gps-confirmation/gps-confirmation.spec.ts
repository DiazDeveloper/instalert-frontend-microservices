import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GpsConfirmation } from './gps-confirmation';

describe('GpsConfirmation', () => {
  let component: GpsConfirmation;
  let fixture: ComponentFixture<GpsConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GpsConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(GpsConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
