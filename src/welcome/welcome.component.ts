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
  MAX_PACKAGE_SIZE = 4_500_000;
  Y: number = 0;
  loading: boolean = false;
  upload_successfull: boolean = false;
  upload_failed: boolean = false;
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
    console.log(this.loading);
    var files = event.target.files;
   files = [...files].filter((el: File) => el.type.startsWith('image/'));
    if (event.target.files && event.target.files[0]) {
      const numberOfFiles = event.target.files.length;
      for (let i = 0; i < numberOfFiles; i++) {
        if(!event.target.files[i].type.startsWith('image/')){
          this.toastr.warning(`Przesłany plik ${event.target.files[i].name} nie jest zdjęciem`, 'Upload nieudany'  , {timeOut: 4000, progressBar: true});
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

  open(){
    this.lockScroll();
    this.popupService.open('modal-1');
  }

  async submitForm(event: any): Promise<void> {
    event.stopPropagation();
    this.loading = true;
    console.log(this.selectedFiles.length);
    let formData = new FormData();
    formData.append('wishes', this.wishes);
    let payloadSize = 0;
    let createFolderResponse:any = await firstValueFrom(this.http.post('https://wandering-magenta-sheet.glitch.me/api/uploadfile', formData));

    if(createFolderResponse.Status == 'OK'){
      if(this.selectedFiles){
        for (let i = 0; i < this.selectedFiles.length; i++) {
          if(this.selectedFiles[i].size <this.MAX_PACKAGE_SIZE){
            if(payloadSize === 0){
              formData.append('photos', this.selectedFiles[i]);
              payloadSize = this.selectedFiles[i].size;
            }else{
              payloadSize += this.selectedFiles[i].size
              if(payloadSize >= this.MAX_PACKAGE_SIZE){
                console.log(formData.getAll('photos'));
                  await firstValueFrom(this.http.post(`https://wandering-magenta-sheet.glitch.me/api/upload/${createFolderResponse.Message}`, formData));
  
                  formData = new FormData();
                  formData.append('photos', this.selectedFiles[i]);
                  payloadSize = this.selectedFiles[i].size;
              }else{
                formData.append('photos', this.selectedFiles[i]);
              }
            }
          }else{
            await this.uploadFileChunked(this.selectedFiles[i], createFolderResponse.Message);
          }
        }
        if(formData.get('photos')){
          console.log(formData.getAll('photos'));
          await firstValueFrom(this.http.post(`https://wandering-magenta-sheet.glitch.me/api/upload/${createFolderResponse.Message}`, formData));

        }
      }
    }
    this.loading = false;
    this.upload_successfull = true;
  }

  eoeoeo(object: any){
    this.uploadFile?.nativeElement.click();
  }

  close(event: any){
    this.popupService.close();
    this.selectedFiles = [];
    this.previews = [];
    this.wishes = "";
    this.upload_successfull  = this.upload_failed = false;
    this.unlockScroll();

  }



  deletePreview(id: string){
    let index = this.previews.map(d => d.id).indexOf(id);
    console.log(this.previews);
    this.previews = this.previews.filter((el: Preview) => el.id != id);
    this.selectedFiles.splice(index, 1);
  }

   unlockScroll () {
    document.body.style.overflow = '';
   // document.body.style.top = '';
   // document.body.style.left = '';
   // document.body.style.right = '';
    //window.scrollTo(0, this.Y * -1);
};

 lockScroll () {
  //  this.Y = window.scrollY;
    document.body.style.overflow = 'hidden';
   // document.body.style.top = `-${window.scrollY}px`;
   // document.body.style.left = '0';
   // document.body.style.right = '0';
   // console.log(window.scrollY);
};

  async uploadFileChunked(file: File, folderId: string) {
    const chunkSize = 4 * 1024 * 1024; // 5 MB in bytes

    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks = [];

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
    }

    const promises = chunks.map((chunk, index) => {
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('index', index.toString());
      formData.append('folderId', folderId);
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileName', file.name);
      formData.append('mimeType', file.type);

      return this.http.post('https://wandering-magenta-sheet.glitch.me/api/uploadchunks', formData).toPromise();
    });

    try {
      await Promise.all(promises);
      console.log('File uploaded successfully.');
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
}

export interface Preview{
  content: string;
  id: string;
}
