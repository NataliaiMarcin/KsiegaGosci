import { Component, Input } from '@angular/core';

@Component({
  selector: 'photo-preview',
  templateUrl: './photo-preview.component.html',
  styleUrls: ['./photo-preview.component.scss']
})
export class PhotoPreviewComponent {
  @Input()
  preview: any;

}
