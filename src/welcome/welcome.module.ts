import { NgModule } from "@angular/core";
import { WelcomeComponent } from "./welcome.component";
import { HttpClient } from "@angular/common/http";
import { BrowserAnimationsModule, provideAnimations } from "@angular/platform-browser/animations";
import { PopupComponent } from "src/app/popup/popup.component";
import { Angular2ImageGalleryModule } from "angular2-image-gallery";
import { HammerModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PhotoPreviewComponent } from "src/app/photo-preview/photo-preview.component";
import { ToastrModule, ToastContainerDirective  } from 'ngx-toastr';
import { PreloaderComponent } from "src/app/preloader/preloader.component";
import { PreloaderModule } from "src/app/preloader/preloader.module";
import { LoadingHearthModule } from "src/app/loading-hearth/loading-hearth.module";

@NgModule({
  declarations: [
    WelcomeComponent, PopupComponent, PhotoPreviewComponent
  ],
  imports: [
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',
      preventDuplicates: true,
      maxOpened: 3,
      autoDismiss: true
    }),
    ToastContainerDirective,
    Angular2ImageGalleryModule,
    HammerModule,
    CommonModule,
    FormsModule,
    PreloaderModule,
    LoadingHearthModule
  ],
  providers: [HttpClient, provideAnimations()],
  exports:[WelcomeComponent],
  bootstrap: [WelcomeComponent]
})
export class WelcomeModule { }
