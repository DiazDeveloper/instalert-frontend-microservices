import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterView } from './register-view';

describe('RegisterView', () => {
  let component: RegisterView;
  let fixture: ComponentFixture<RegisterView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterView],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
