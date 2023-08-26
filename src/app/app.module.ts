import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from 'src/footer/footer.component';
import { Angular2ImageGalleryModule } from 'angular2-image-gallery';
import { LoadingInterceptor } from './Interceptors/loading.interceptor';
import { WelcomeModule } from 'src/welcome/welcome.module';
import { PreloaderModule } from './preloader/preloader.module';

@NgModule({
  declarations: [
    AppComponent, FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    Angular2ImageGalleryModule,
    HammerModule,
    WelcomeModule,
    PreloaderModule
  ],
  providers: [HttpClient, provideAnimations(),    {
    provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
