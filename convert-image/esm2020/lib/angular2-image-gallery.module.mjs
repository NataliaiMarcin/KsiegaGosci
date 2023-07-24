import { NgModule } from '@angular/core';
import { ImageService } from './services/image.service';
import { GalleryComponent } from './gallery/gallery.component';
import { ViewerComponent } from './viewer/viewer.component';
import { CommonModule } from '@angular/common';
import 'hammerjs';
import * as i0 from "@angular/core";
export class Angular2ImageGalleryModule {
}
Angular2ImageGalleryModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: Angular2ImageGalleryModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
Angular2ImageGalleryModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "15.1.1", ngImport: i0, type: Angular2ImageGalleryModule, declarations: [GalleryComponent, ViewerComponent], imports: [CommonModule], exports: [GalleryComponent, ViewerComponent] });
Angular2ImageGalleryModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: Angular2ImageGalleryModule, providers: [ImageService], imports: [CommonModule] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: Angular2ImageGalleryModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [CommonModule],
                    declarations: [GalleryComponent, ViewerComponent],
                    providers: [ImageService],
                    exports: [GalleryComponent, ViewerComponent],
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjItaW1hZ2UtZ2FsbGVyeS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyMi1pbWFnZS1nYWxsZXJ5L3NyYy9saWIvYW5ndWxhcjItaW1hZ2UtZ2FsbGVyeS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDdkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUU5QyxPQUFPLFVBQVUsQ0FBQTs7QUFRakIsTUFBTSxPQUFPLDBCQUEwQjs7dUhBQTFCLDBCQUEwQjt3SEFBMUIsMEJBQTBCLGlCQUp0QixnQkFBZ0IsRUFBRSxlQUFlLGFBRHRDLFlBQVksYUFHWixnQkFBZ0IsRUFBRSxlQUFlO3dIQUVoQywwQkFBMEIsYUFIMUIsQ0FBQyxZQUFZLENBQUMsWUFGZixZQUFZOzJGQUtYLDBCQUEwQjtrQkFOdEMsUUFBUTttQkFBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3ZCLFlBQVksRUFBRSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQztvQkFDakQsU0FBUyxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUN6QixPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUM7aUJBQzdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHsgSW1hZ2VTZXJ2aWNlIH0gZnJvbSAnLi9zZXJ2aWNlcy9pbWFnZS5zZXJ2aWNlJ1xuaW1wb3J0IHsgR2FsbGVyeUNvbXBvbmVudCB9IGZyb20gJy4vZ2FsbGVyeS9nYWxsZXJ5LmNvbXBvbmVudCdcbmltcG9ydCB7IFZpZXdlckNvbXBvbmVudCB9IGZyb20gJy4vdmlld2VyL3ZpZXdlci5jb21wb25lbnQnXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nXG5cbmltcG9ydCAnaGFtbWVyanMnXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtHYWxsZXJ5Q29tcG9uZW50LCBWaWV3ZXJDb21wb25lbnRdLFxuICBwcm92aWRlcnM6IFtJbWFnZVNlcnZpY2VdLFxuICBleHBvcnRzOiBbR2FsbGVyeUNvbXBvbmVudCwgVmlld2VyQ29tcG9uZW50XSxcbn0pXG5leHBvcnQgY2xhc3MgQW5ndWxhcjJJbWFnZUdhbGxlcnlNb2R1bGUge31cbiJdfQ==