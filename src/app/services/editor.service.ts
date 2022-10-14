import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Editor } from '../interfaces/editor';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private url: string = 'https://thibaultmorizet.fr/ws/editors';
  private editors: Array<object> = [];

  constructor(private http: HttpClient) {}

  getAllEditors() {
    return this.http.get<Array<Editor>>(this.url);
  }
  getEditorByName(name: String | undefined) {
    return this.http.get<Array<Editor>>(
      'https://thibaultmorizet.fr/ws/editors?name=' + name
    );
  }
  setEditor(editor: Editor) {
    return this.http.post<{ token: string }>(
      'https://thibaultmorizet.fr/ws/editors',
      editor
    );
  }
}
