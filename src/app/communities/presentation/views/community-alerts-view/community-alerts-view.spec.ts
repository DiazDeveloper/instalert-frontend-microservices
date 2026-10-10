import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityAlertsView } from './community-alerts-view';

describe('CommunityAlertsView', () => {
  let component: CommunityAlertsView;
  let fixture: ComponentFixture<CommunityAlertsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityAlertsView],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunityAlertsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
