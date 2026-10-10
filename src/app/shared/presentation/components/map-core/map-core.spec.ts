import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCore } from './map-core';

describe('MapCore', () => {
  let component: MapCore;
  let fixture: ComponentFixture<MapCore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCore],
    }).compileComponents();

    fixture = TestBed.createComponent(MapCore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
