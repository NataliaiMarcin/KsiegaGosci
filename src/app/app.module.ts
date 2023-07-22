import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WelcomeComponent } from 'src/welcome/welcome.component';
import { FooterComponent } from 'src/footer/footer.component';
import { Angular2ImageGalleryModule } from 'angular2-image-gallery';

@NgModule({
  declarations: [
    AppComponent, WelcomeComponent, FooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    Angular2ImageGalleryModule,
    HammerModule
  ],
  providers: [HttpClient, provideAnimations()],
  bootstrap: [AppComponent]
})
export class AppModule { }
