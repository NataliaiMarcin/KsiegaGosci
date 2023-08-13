import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Preview } from 'src/welcome/welcome.component';

@Component({
  selector: 'photo-preview',
  templateUrl: './photo-preview.component.html',
  styleUrls: ['./photo-preview.component.scss']
})
export class PhotoPreviewComponent {
  @Input()
  content!: Preview;

  @Output()
  delete = new EventEmitter<string>();

  inc() {
    this.delete.emit(this.content?.id);
  }

}
