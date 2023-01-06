import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { SocialLoginModule } from 'angularx-social-login';
import { NgxIziToastModule } from 'ngx-izitoast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { HttpLoaderFactory } from 'src/app/app.module';
import { AdminFooterComponent } from '../partial/admin-footer/admin-footer.component';
import { AdminHeaderComponent } from '../partial/admin-header/admin-header.component';

import { AdminVideosComponent } from './admin-videos.component';

describe('AdminVideosComponent', () => {
  let component: AdminVideosComponent;
  let fixture: ComponentFixture<AdminVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AdminVideosComponent,
        AdminHeaderComponent,
        AdminFooterComponent,
      ],
      imports: [
        NgxIziToastModule,
        HttpClientModule,
        RouterTestingModule,
        SocialLoginModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        TableModule,
        ConfirmDialogModule,
        DialogModule,
        ToolbarModule,
        ToastModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
