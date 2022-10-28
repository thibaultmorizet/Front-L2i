import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import StorageCrypter from 'storage-crypter';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() basketLength: number = 0;
  storageCrypter = new StorageCrypter('Secret');
  connectedUser: User | null = {};
  path: string = '';

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe((el) => {
      this.path = el[0].path;
    });

    try {
      this.connectedUser = JSON.parse(
        this.storageCrypter.getItem('user', 'session')
      );
    } catch (error) {
      this.connectedUser = null;
    }
  }
}
