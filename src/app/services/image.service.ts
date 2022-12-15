import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ArrayOfImageToUpload } from '../interfaces/ArrayOfImageToUpload';
import { Image } from '../interfaces/image';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private url: string = 'https://thibaultmorizet.fr/ws/images';

  constructor(private http: HttpClient) {}

  getOneImage(id: number) {
    return this.http.get<Image>(this.url + id);
  }
  getAllImagesForABook(book_id: number) {
    return this.http.get<Array<Image>>(this.url + '?book.id=' + book_id);
  }
  createImage(image: Image) {   
    return this.http.post<Image>(this.url, image);
  }
  updateImage(id: number | undefined, image: Image) {
    return this.http.put<{ token: string }>(this.url + '/' + id, image);
  }

  deleteImage(id: number | undefined) {    
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
  addImage(imageInfo: ArrayOfImageToUpload) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/add_image',
      imageInfo
    );
  }
  deleteImageOfServer(imageUrl: object) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/delete_image',
      imageUrl
    );
  }
}
