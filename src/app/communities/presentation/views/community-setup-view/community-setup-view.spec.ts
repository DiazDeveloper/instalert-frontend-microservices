import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunitySetupView } from './community-setup-view';

describe('CommunitySetupView', () => {
  let component: CommunitySetupView;
  let fixture: ComponentFixture<CommunitySetupView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunitySetupView],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunitySetupView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
