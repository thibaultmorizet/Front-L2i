import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Comment } from '../interfaces/comment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private url: string = 'https://thibaultmorizet.fr/ws/comments';

  constructor(private http: HttpClient) {}

  getAllComments() {
    return this.http.get<Array<Comment>>(this.url);
  }
  getCommentById(id: Number | undefined) {
    return this.http.get<Array<Comment>>(
      'https://thibaultmorizet.fr/ws/comments?id=' + id
    );
  }
  setComment(comment: Comment) {
    return this.http.post<{ token: string }>(this.url, comment);
  }

  updateComment(id: number | undefined, comment: Comment) {
    return this.http.put<{ token: string }>(this.url + '/' + id, comment);
  }

  deleteTheComment(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
