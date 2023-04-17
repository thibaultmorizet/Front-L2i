import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {NgxIzitoastService} from 'ngx-izitoast';
import {
  PrimeNGConfig,
  ConfirmationService,
  MessageService,
} from 'primeng/api';
import {Observable, Subscriber} from 'rxjs';
import {Author} from 'src/app/interfaces/author';
import {Product} from 'src/app/interfaces/product';
import {Image} from 'src/app/interfaces/image';
import {Taxe} from 'src/app/interfaces/taxe';
import {Category} from 'src/app/interfaces/category';
import {User} from 'src/app/interfaces/user';
import {ProductService} from 'src/app/services/product.service';
import {TaxeService} from 'src/app/services/taxe.service';
import StorageCrypter from 'storage-crypter';
import {VideoService} from 'src/app/services/video.service';
import {BrandService} from 'src/app/services/brand.service';
import {Brand} from 'src/app/interfaces/brand';

@Component({
  selector: 'app-admin-videos',
  templateUrl: './admin-videos.component.html',
  styleUrls: ['./admin-videos.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService, MessageService],
})
export class AdminVideosComponent implements OnInit {
  storageCrypter = new StorageCrypter('Secret');
  connectedAdmin: User | null = {};
  videoDialog: boolean = false;
  allVideos: Product[] = [];
  video: Product = {};
  selectedVideos: Product[] = [];
  submitted: boolean = false;
  brands: Array<Brand> = [];
  taxes: Array<Taxe> = [];
  authors: Array<Author> = [];
  categories: Array<Category> = [];
  imageInfo: Image = {};

  constructor(
    private router: Router,
    private ps: ProductService,
    private vs: VideoService,
    private brandService: BrandService,
    private taxeService: TaxeService,
    private primengConfig: PrimeNGConfig,
    private confirmationService: ConfirmationService,
    private iziToast: NgxIzitoastService,
    private translate: TranslateService
  ) {
  }

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

    this.vs.getAllVideosWithoutLimit('', [], [], null).subscribe((data) => {
      this.allVideos = data;
    });

    this.getAllTaxesfunc();
    this.getAllBrandsfunc();
  }

  tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  adminLogout() {
    this.storageCrypter.removeItem('jeton', 'local');
    this.storageCrypter.removeItem('cart', 'local');
    this.storageCrypter.removeItem('user', 'session');
    this.storageCrypter.removeItem('moderatorUser', 'session');
    this.storageCrypter.removeItem('adminUser', 'session');
    this.storageCrypter.removeItem('language', 'session');
    this.connectedAdmin = null;
    this.router.navigateByUrl('/admin/login');
    this.iziToast.success({
      message: this.translate.instant('izitoast.you_re_logout'),
      position: 'topRight',
    });
  }

  openNew() {
    this.video = {
      unitpriceht: 1,
      stock: 1,
      year: '1850',
    };
    this.submitted = false;
    this.videoDialog = true;
  }

  deleteSelectedVideos() {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_videos.confirm_group_delete_videos_message'
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allVideos = this.allVideos.filter(
          (val) => !this.selectedVideos.includes(val)
        );
        this.selectedVideos.forEach((aVideo) => {
          let imageUrlToDelete = {
            imageUrl: aVideo.image?.substring(aVideo.image?.indexOf('assets')),
          };

          this.ps.deleteImage(imageUrlToDelete).subscribe(() => {
          });

          this.vs.deleteTheVideo(aVideo.id).subscribe(() => {
          });
        });
        this.selectedVideos = [];
        this.iziToast.success({
          message: this.translate.instant('admin_videos.videos_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  editVideo(video: Product) {
    video.author?.forEach((anAuthor) => {
      anAuthor.name = anAuthor.firstname + ' ' + anAuthor.lastname;
    });
    this.video = {...video};
    this.videoDialog = true;
  }

  deleteVideo(video: Product) {
    this.confirmationService.confirm({
      message: this.translate.instant(
        'admin_videos.confirm_delete_video_message',
        {title: video.title}
      ),
      header: this.translate.instant('general.confirm'),
      icon: 'pi pi-exclamation-triangle',
      dismissableMask: true,
      accept: () => {
        this.allVideos = this.allVideos.filter((val) => val.id !== video.id);
        let imageUrlToDelete = {
          imageUrl: video.image?.substring(video.image?.indexOf('assets')),
        };

        this.ps.deleteImage(imageUrlToDelete).subscribe(() => {
        });
        this.vs.deleteTheVideo(video.id).subscribe(() => {
        });
        this.video = {};

        this.iziToast.success({
          message: this.translate.instant('admin_videos.video_deleted'),
          position: 'topRight',
        });
      },
    });
  }

  hideDialog() {
    this.videoDialog = false;
    this.submitted = false;
  }

  saveVideo() {
    this.submitted = true;

    if (this.video.year) {
      this.video.year = this.video.year.toString();
    }
    if (this.video.id) {
      if (this.imageInfo.data) {
        this.imageInfo.productId = this.video.id?.toString();

        if (this.imageInfo.url) {
          this.video.image =
            'https://www.thibaultmorizet.fr/assets/product-images/' +
            this.video.id +
            '.' +
            this.imageInfo.url.split('.').pop();
        } else {
          this.video.image =
            'https://www.thibaultmorizet.fr/assets/product-images/' +
            this.video.id +
            '.jpeg';
        }
        this.ps.addImage(this.imageInfo).subscribe();
      }
      this.vs.updateVideo(this.video.id, this.video).subscribe(() => {
        this.video = {};
        this.ngOnInit();
        this.iziToast.success({
          message: this.translate.instant('admin_videos.video_updated'),
          position: 'topRight',
        });
      });
    } else {
      this.allVideos.push(this.video);
      this.vs.createVideo(this.video).subscribe((res) => {
        if (this.imageInfo.data) {
          this.imageInfo.productId = res.id?.toString();
          if (this.imageInfo.url) {
            this.video.image =
              'https://www.thibaultmorizet.fr/assets/product-images/' +
              res.id +
              '.' +
              this.imageInfo.url.split('.').pop();
          } else {
            this.video.image =
              'https://www.thibaultmorizet.fr/assets/product-images/' +
              res.id +
              '.jpeg';
          }

          this.ps.addImage(this.imageInfo).subscribe();
        }
        this.vs.updateVideo(res.id, this.video).subscribe(() => {
          this.video = {};
          this.ngOnInit();
          this.iziToast.success({
            message: this.translate.instant('admin_videos.video_created'),
            position: 'topRight',
          });
        });
      });
    }

    this.allVideos = [...this.allVideos];
    this.videoDialog = false;
    this.video = {};
  }

  getAllTaxesfunc() {
    this.taxeService.getAllTaxes().subscribe((res) => {
      res.forEach((aTaxe) => {
        delete aTaxe.products;
      });
      this.taxes = res;
    });
  }

  getAllBrandsfunc() {
    this.brandService.getAllBrands().subscribe((res) => {
      res.forEach((aBrand) => {
        delete aBrand.videos;
      });
      this.brands = res;
    });
  }

  addImageToServer($event: Event) {
    const target = $event.target as HTMLInputElement;

    const file: File = (target.files as FileList)[0];

    this.imageInfo = {
      url: file.name,
    };

    this.convertToBase64(file);
  }

  convertToBase64(file: File) {
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file, subscriber);
    });
    observable.subscribe((d) => {
      this.imageInfo.data = d.substring(d.indexOf('base64,') + 7);
    });
  }

  readFile(file: File, subscriber: Subscriber<any>) {
    const filereader = new FileReader();
    filereader.readAsDataURL(file);
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete();
    };
    filereader.onerror = () => {
      subscriber.error();
      subscriber.complete();
    };
  }

  getUnitpricettcFromUnitpricehtAndTva(
    unitpriceht: number | undefined,
    tva: number | undefined
  ) {
    if (unitpriceht != undefined) {
      if (tva != undefined) {
        return (unitpriceht + (tva * unitpriceht) / 100).toFixed(2);
      }
      return unitpriceht.toFixed(2);
    }
    return null;
  }
}
