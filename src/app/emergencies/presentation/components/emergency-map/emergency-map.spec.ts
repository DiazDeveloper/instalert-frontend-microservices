import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyMap } from './emergency-map';

describe('EmergencyMap', () => {
  let component: EmergencyMap;
  let fixture: ComponentFixture<EmergencyMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyMap],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
