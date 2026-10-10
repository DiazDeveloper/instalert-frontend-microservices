import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationResponseView } from './invitation-response-view';

describe('InvitationResponseView', () => {
  let component: InvitationResponseView;
  let fixture: ComponentFixture<InvitationResponseView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationResponseView],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitationResponseView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
