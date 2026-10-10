import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergenciesView } from './emergencies-view';

describe('EmergenciesView', () => {
  let component: EmergenciesView;
  let fixture: ComponentFixture<EmergenciesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergenciesView],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergenciesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
