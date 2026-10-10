import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSettingsView } from './profile-settings-view';

describe('ProfileSettingsView', () => {
  let component: ProfileSettingsView;
  let fixture: ComponentFixture<ProfileSettingsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSettingsView],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSettingsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
