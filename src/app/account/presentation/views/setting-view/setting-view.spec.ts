import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingView } from './setting-view';

describe('SettingView', () => {
  let component: SettingView;
  let fixture: ComponentFixture<SettingView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingView],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
