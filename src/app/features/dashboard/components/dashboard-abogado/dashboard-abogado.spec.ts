import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAbogado } from './dashboard-abogado';

describe('DashboardAbogado', () => {
  let component: DashboardAbogado;
  let fixture: ComponentFixture<DashboardAbogado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAbogado],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAbogado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
