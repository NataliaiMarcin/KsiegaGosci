import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PopupService } from 'src/app/Services/popup.service';

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private titleService: Title, public popupService: PopupService) {
    this.titleService.setTitle('Ślub Natali i Marcina');
  }

  ngOnInit(): void {
  }
}
