import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminFormatsComponent } from './admin-formats.component';

describe('AdminFormatsComponent', () => {
  let component: AdminFormatsComponent;
  let fixture: ComponentFixture<AdminFormatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminFormatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminFormatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
