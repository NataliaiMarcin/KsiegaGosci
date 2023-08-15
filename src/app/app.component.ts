import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { PopupService } from './Services/popup.service';
import { LoaderService } from './Services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  selectedFiles: FileList | undefined;
  wishes: string | undefined;

  constructor(private http: HttpClient, private loadingService: LoaderService, public popupService: PopupService) {
    this.loadingService.setLoading(true);
  }

  onFileChange(event:any): void {
    this.selectedFiles = event.target.files;
  }

  submitForm(f: NgForm): void {
    const formData = new FormData();
    if(this.selectedFiles){
      for (let i = 0; i < this.selectedFiles.length; i++) {
        formData.append('photos', this.selectedFiles[i]);
      }

    formData.append('wishes', f.value.wishes);

      this.http.post('http://localhost:3000/api/upload', formData).subscribe(response => {
      });

      // this.http.post('https://tasty-overshirt-jay.cyclic.app/api/upload', formData).subscribe(response => {
      //   console.log(response);
      // });
    }
  }

}
