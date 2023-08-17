import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { firstValueFrom, timeout } from 'rxjs';
import { PopupService } from 'src/app/Services/popup.service';
import * as uuid from 'uuid';

declare let ZoomSlider:any;
declare var $:any;

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, AfterViewInit {
  selectedFiles: File[] = [];
  wishes!: string;
  previews: Preview[] = [];
  MAX_PACKAGE_SIZE = 5_000_000;
  @ViewChild('uploadFile') uploadFile: ElementRef | undefined;

  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer!: ToastContainerDirective;

  constructor(private titleService: Title, public popupService: PopupService, private http: HttpClient, private toastr: ToastrService) {
    this.titleService.setTitle('Ślub Natali i Marcina');
  }
  ngAfterViewInit(): void {
    ZoomSlider($, window, document, undefined);
  }

  ngOnInit() {
    this.toastr.overlayContainer = this.toastContainer;
  }

  

  onFileChange(event:any): void {
    var files = event.target.files;
   files = [...files].filter((el: File) => el.size < this.MAX_PACKAGE_SIZE);
    if (event.target.files && event.target.files[0]) {
      const numberOfFiles = event.target.files.length;
      for (let i = 0; i < numberOfFiles; i++) {
        if(event.target.files[i].size > this.MAX_PACKAGE_SIZE){
          this.toastr.warning(`Rozmiar zdjęcia ${event.target.files[i].name} przekracza 5MB`, 'Upload nieudany'  , {timeOut: 2000, progressBar: true});
          continue;
        }else{
          const reader = new FileReader();

          reader.onload = (e: any) => {
            this.previews.push({content: e.target.result, id: uuid.v4()});
          };
          reader.readAsDataURL(event.target.files[i]);
        }

      }
    }
    this.selectedFiles = this.selectedFiles.concat(files);
  }

  async submitForm(event: any): Promise<void> {
    event.stopPropagation();
    let formData = new FormData();
    let payloadSize = 0;
    let createFolderResponse:any = await firstValueFrom(this.http.post('https://tasty-overshirt-jay.cyclic.app/api/createfolder', formData));
    formData.append('wishes', this.wishes);
    payloadSize += new Blob([this.wishes]).size;

    if(createFolderResponse.Status == 'OK'){
      if(this.selectedFiles){
        for (let i = 0; i < this.selectedFiles.length; i++) {
          if(payloadSize === 0){
            formData.append('photos', this.selectedFiles[i]);
            payloadSize = this.selectedFiles[i].size;
          }else{
            payloadSize += this.selectedFiles[i].size
            if(payloadSize >= this.MAX_PACKAGE_SIZE){
              console.log(formData.get('photos'));
                await firstValueFrom(this.http.post(`https://tasty-overshirt-jay.cyclic.app/api/upload/${createFolderResponse.Message}`, formData));

                payloadSize = 0;
                formData = new FormData();
            }else{
              formData.append('photos', this.selectedFiles[i]);
            }
          }
        }
        if(formData != new FormData()){
          console.log(formData.get('photos'));
          await firstValueFrom(this.http.post(`https://tasty-overshirt-jay.cyclic.app/api/upload/${createFolderResponse.Message}`, formData));

        }
      }
    }

  }

  eoeoeo(object: any){
    this.uploadFile?.nativeElement.click();
  }

  close(){
    this.popupService.close();
  }

  deletePreview(id: String){
    this.previews = this.previews.filter((el: Preview) => el.id != id);
  }
}

export interface Preview{
  content: string;
  id: string;
}
