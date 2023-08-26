import { NgModule } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BrowserAnimationsModule, provideAnimations } from "@angular/platform-browser/animations";
import { PreloaderComponent } from "src/app/preloader/preloader.component";
import { LoadingHearthModule } from "../loading-hearth/loading-hearth.module";

@NgModule({
  declarations: [
     PreloaderComponent
  ],
  imports: [
    BrowserAnimationsModule,
    LoadingHearthModule
  ],
  providers: [HttpClient, provideAnimations()],
  exports:[PreloaderComponent],
  bootstrap: [PreloaderComponent]
})
export class PreloaderModule { }
