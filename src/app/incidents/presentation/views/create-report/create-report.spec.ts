import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearReporteComponent } from './create-report';
import { RouterTestingModule } from '@angular/router/testing';

describe('CrearReporteComponent', () => {
  let component: CrearReporteComponent;
  let fixture: ComponentFixture<CrearReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearReporteComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
