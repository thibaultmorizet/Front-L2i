import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditorsComponent } from './admin-editors.component';

describe('AdminEditorsComponent', () => {
  let component: AdminEditorsComponent;
  let fixture: ComponentFixture<AdminEditorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEditorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEditorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
