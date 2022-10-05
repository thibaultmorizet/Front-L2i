import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketDetailsComponent } from './basket-details.component';

describe('BasketDetailsComponent', () => {
  let component: BasketDetailsComponent;
  let fixture: ComponentFixture<BasketDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasketDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasketDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
