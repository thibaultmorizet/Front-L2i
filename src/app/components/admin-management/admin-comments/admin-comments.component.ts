import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxIzitoastService } from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import { Comment } from 'src/app/interfaces/comment';
import { User } from 'src/app/interfaces/user';
import StorageCrypter from 'storage-crypter';
import { CommentService } from 'src/app/services/comment.service';

@Component({
  selector: 'app-admin-comments',
  templateUrl: './admin-comments.component.html',
  styleUrls: ['./admin-comments.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminCommentsComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  allComments: Comment[] = [];
  commentsStatut: number = 1;

  constructor(
    private router: Router,
    private commentService: CommentService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = true;
    this.translate.use(this.translate.getDefaultLang());

    try {
      this.connectedAdmin = JSON.parse(
        this.storageCrypter.getItem('adminUser', 'session')
      );
    } catch (error) {
      this.connectedAdmin = null;
      this.router.navigateByUrl('/admin/login');
    }

    if (this.storageCrypter.getItem('jeton', 'local')) {
      if (this.tokenExpired(this.storageCrypter.getItem('jeton', 'local'))) {
        this.adminLogout();
      }
    }
    this.activatedRoute.url.subscribe((el) => {
      this.commentsStatut = parseInt(el[2].path);
      this.commentService
        .getAllCommentsByStatut(this.commentsStatut)
        .subscribe((data) => {
          this.allComments = data;
          if (this.commentsStatut == 1) {
            this.allComments.sort((objA, objB) => {
              if (objB.createdAt != undefined && objA.createdAt != undefined) {
                let date1 = new Date(objA.createdAt);
                let date2 = new Date(objB.createdAt);

                return -(date2.getTime() - date1.getTime());
              }
              return 0;
            });
          }
        });
    });
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  adminLogout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedAdmin = null;
    this.router.navigateByUrl('/admin/login');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }

  getCommentDate(createdAt: Date | undefined) {
    if (typeof createdAt == 'string') {
      const date = new Date(createdAt);

      return this.translate.instant('product_details.on_date_at_hour', {
        date: date.toLocaleDateString(),
        hours: date.getHours() + ':' + date.getMinutes(),
      });
    }
    return '';
  }

  rejectComment(comment: Comment) {
    if (comment.id && comment.commentstatut) {
      this.confirmationService.confirm({
        message: this.translate.instant('comments.confirm_reject_comment', {
          text: comment.text,
        }),
        header: this.translate.instant('general.confirm'),
        icon: 'pi pi-exclamation-triangle',
        dismissableMask: true,
        accept: () => {
          comment.commentstatut = { id: 3 };
          this.commentService
            .updateComment(comment.id, comment)
            .subscribe((el) => {
              this.allComments.splice(this.allComments.indexOf(comment), 1);
              this.iziToast.success({
                message: this.translate.instant('comments.comment_rejected'),
                position: 'topRight',
              });
            });
        },
      });
      return;
    }
    this.iziToast.error({
      message: this.translate.instant('comments.comment_not_rejected'),
      position: 'topRight',
    });
  }
  validateComment(comment: Comment) {
    if (comment.id && comment.commentstatut) {
      this.confirmationService.confirm({
        message: this.translate.instant('comments.confirm_validate_comment', {
          text: comment.text,
        }),
        header: this.translate.instant('general.confirm'),
        icon: 'pi pi-exclamation-triangle',
        dismissableMask: true,
        accept: () => {
          comment.commentstatut = { id: 2 };
          this.commentService
            .updateComment(comment.id, comment)
            .subscribe((el) => {
              this.allComments.splice(this.allComments.indexOf(comment), 1);
              this.iziToast.success({
                message: this.translate.instant('comments.comment_validated'),
                position: 'topRight',
              });
            });
        },
      });
      return;
    }
    this.iziToast.error({
      message: this.translate.instant('comments.comment_not_validated'),
      position: 'topRight',
    });
  }
}
