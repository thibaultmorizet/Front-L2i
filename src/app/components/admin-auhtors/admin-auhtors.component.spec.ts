import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAuhtorsComponent } from './admin-auhtors.component';

describe('AdminAuhtorsComponent', () => {
  let component: AdminAuhtorsComponent;
  let fixture: ComponentFixture<AdminAuhtorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAuhtorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAuhtorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
