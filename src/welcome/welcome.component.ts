import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PopupService } from 'src/app/Services/popup.service';

declare let ZoomSlider:any;
declare var $:any;
@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit, AfterViewInit {
  constructor(private titleService: Title, public popupService: PopupService) {
    this.titleService.setTitle('Ślub Natali i Marcina');
  }
  ngAfterViewInit(): void {
    ZoomSlider($, window, document, undefined);
  }

  ngOnInit(): void {

  }
}
