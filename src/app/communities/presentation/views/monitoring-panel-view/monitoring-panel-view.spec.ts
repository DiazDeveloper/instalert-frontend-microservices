import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringPanelView } from './monitoring-panel-view';

describe('MonitoringPanelView', () => {
  let component: MonitoringPanelView;
  let fixture: ComponentFixture<MonitoringPanelView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringPanelView],
    }).compileComponents();

    fixture = TestBed.createComponent(MonitoringPanelView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
