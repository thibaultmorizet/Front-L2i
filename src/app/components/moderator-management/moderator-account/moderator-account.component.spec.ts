import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorAccountComponent } from './moderator-account.component';

describe('ModeratorAccountComponent', () => {
  let component: ModeratorAccountComponent;
  let fixture: ComponentFixture<ModeratorAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModeratorAccountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModeratorAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
