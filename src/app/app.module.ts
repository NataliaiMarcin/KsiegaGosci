import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WelcomeComponent } from 'src/welcome/welcome.component';
import { FooterComponent } from 'src/footer/footer.component';
import { Angular2ImageGalleryModule } from 'angular2-image-gallery';
import { PreloaderComponent } from './preloader/preloader.component';
import { LoadingInterceptor } from './Interceptors/loading.interceptor';
import { WelcomeModule } from 'src/welcome/welcome.module';
import { PopupComponent } from './popup/popup.component';
import { PhotoPreviewComponent } from './photo-preview/photo-preview.component';

@NgModule({
  declarations: [
    AppComponent, FooterComponent, PreloaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    Angular2ImageGalleryModule,
    HammerModule,
    WelcomeModule
  ],
  providers: [HttpClient, provideAnimations(),    {
    provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
