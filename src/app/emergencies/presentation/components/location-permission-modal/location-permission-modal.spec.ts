import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPermissionModal } from './location-permission-modal';

describe('LocationPermissionModal', () => {
  let component: LocationPermissionModal;
  let fixture: ComponentFixture<LocationPermissionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPermissionModal],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationPermissionModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
