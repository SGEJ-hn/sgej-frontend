import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentosExpediente } from './documentos-expediente';

describe('DocumentosExpediente', () => {
  let component: DocumentosExpediente;
  let fixture: ComponentFixture<DocumentosExpediente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentosExpediente],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentosExpediente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
