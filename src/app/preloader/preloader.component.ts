import { Component } from '@angular/core';
import { LoaderService } from '../Services/loader.service';

@Component({
  selector: 'app-preloader',
  templateUrl: './preloader.component.html',
  styleUrls: ['./preloader.component.scss']
})
export class PreloaderComponent {

  constructor(public loader: LoaderService){}

}
