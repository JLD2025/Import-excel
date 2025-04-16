import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalPantallaComponent } from './principal-pantalla.component';

describe('PrincipalPantallaComponent', () => {
  let component: PrincipalPantallaComponent;
  let fixture: ComponentFixture<PrincipalPantallaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrincipalPantallaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalPantallaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
