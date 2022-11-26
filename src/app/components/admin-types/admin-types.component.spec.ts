import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SocialLoginModule } from 'angularx-social-login';
import { NgxIziToastModule } from 'ngx-izitoast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { SliderModule } from 'primeng/slider';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { HttpLoaderFactory } from 'src/app/app.module';
import { AdminFooterComponent } from '../partial/admin-footer/admin-footer.component';
import { AdminHeaderComponent } from '../partial/admin-header/admin-header.component';

import { AdminTypesComponent } from './admin-types.component';

describe('AdminTypesComponent', () => {
  let component: AdminTypesComponent;
  let fixture: ComponentFixture<AdminTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AdminTypesComponent,
        AdminHeaderComponent,
        AdminFooterComponent,
      ],
      imports: [
        NgxIziToastModule,
        RouterTestingModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        SliderModule,
        PaginatorModule,
        DialogModule,
        MultiSelectModule,
        ConfirmDialogModule,
        TableModule,
        ToastModule,
        ToolbarModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
