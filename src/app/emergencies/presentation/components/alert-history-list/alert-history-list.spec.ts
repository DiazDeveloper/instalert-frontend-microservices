import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertHistoryList } from './alert-history-list';

describe('AlertHistoryList', () => {
  let component: AlertHistoryList;
  let fixture: ComponentFixture<AlertHistoryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertHistoryList],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertHistoryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
