import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-hearth',
  templateUrl: './loading-hearth.component.html',
  styleUrls: ['./loading-hearth.component.scss']
})
export class LoadingHearthComponent {
  @Input()
  title: string= "";

}
