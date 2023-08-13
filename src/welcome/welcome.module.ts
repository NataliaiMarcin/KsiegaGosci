import { NgModule } from "@angular/core";
import { WelcomeComponent } from "./welcome.component";
import { HttpClient } from "@angular/common/http";
import { provideAnimations } from "@angular/platform-browser/animations";
import { PopupComponent } from "src/app/popup/popup.component";
import { Angular2ImageGalleryModule } from "angular2-image-gallery";
import { HammerModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PhotoPreviewComponent } from "src/app/photo-preview/photo-preview.component";


@NgModule({
  declarations: [
    WelcomeComponent, PopupComponent, PhotoPreviewComponent
  ],
  imports: [
    Angular2ImageGalleryModule,
    HammerModule,
    CommonModule,
    FormsModule
  ],
  providers: [HttpClient, provideAnimations()],
  exports:[WelcomeComponent],
  bootstrap: [WelcomeComponent]
})
export class WelcomeModule { }
