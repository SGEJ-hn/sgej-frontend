import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OlvidePassword } from './olvide-password';

describe('OlvidePassword', () => {
  let component: OlvidePassword;
  let fixture: ComponentFixture<OlvidePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OlvidePassword],
    }).compileComponents();

    fixture = TestBed.createComponent(OlvidePassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
