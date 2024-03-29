import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Editor } from '../interfaces/editor';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private url: string = 'https://back-l2i.thibaultmorizet.fr/ws/editors';

  constructor(private http: HttpClient) {}

  getAllEditors() {
    return this.http.get<Array<Editor>>(this.url);
  }
  getEditorByName(name: string | undefined) {
    return this.http.get<Array<Editor>>(
      'https://back-l2i.thibaultmorizet.fr/ws/editors?name=' + name
    );
  }
  updateEditor(id: number | undefined, editor: Editor) {
    return this.http.put<{ token: string }>(this.url + '/' + id, editor);
  }

  createEditor(editor: Editor) {
    return this.http.post<Editor>(this.url, editor);
  }
  deleteTheEditor(id: number | undefined) {
    return this.http.delete<{ token: string }>(this.url + '/' + id);
  }
}
