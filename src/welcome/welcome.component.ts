import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PopupService } from 'src/app/Services/popup.service';

declare let ZoomSlider:any;
declare var $:any;
@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, AfterViewInit {
  selectedFiles: FileList | undefined;
  wishes: string | undefined;
  previews: string[] = [];
  @ViewChild('uploadFile') uploadFile: ElementRef | undefined;

  constructor(private titleService: Title, public popupService: PopupService, private http: HttpClient) {
    this.titleService.setTitle('Ślub Natali i Marcina');
  }
  ngAfterViewInit(): void {
    ZoomSlider($, window, document, undefined);
  }

  ngOnInit(): void {

  }

  

  onFileChange(event:any): void {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();

        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.previews.push(e.target.result);
        };

        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }

  submitForm(f: NgForm): void {
    const formData = new FormData();
    if(this.selectedFiles){
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('photos', this.selectedFiles[i]);
      }

    formData.append('wishes', f.value.wishes);

      this.http.post('https://tasty-overshirt-jay.cyclic.app/api/upload', formData).subscribe(response => {
        console.log(response);
      });;
    }
  }

  eoeoeo(object: any){
    this.uploadFile?.nativeElement.click();
  }

  close(){
    this.popupService.close();
  }
}
