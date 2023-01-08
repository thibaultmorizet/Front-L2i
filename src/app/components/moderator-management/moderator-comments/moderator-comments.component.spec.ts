import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { AdminFooterComponent } from '../../partial/admin-footer/admin-footer.component';
import { AdminHeaderComponent } from '../../partial/admin-header/admin-header.component';

import { ModeratorCommentsComponent } from './moderator-comments.component';

describe('ModeratorCommentsComponent', () => {
  let component: ModeratorCommentsComponent;
  let fixture: ComponentFixture<ModeratorCommentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ModeratorCommentsComponent,
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

    fixture = TestBed.createComponent(ModeratorCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
