import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
export class ImageService {
    constructor() {
        this.imagesUpdatedSource = new Subject();
        this.imageSelectedIndexUpdatedSource = new Subject();
        this.showImageViewerSource = new Subject();
        this.imagesUpdated$ = this.imagesUpdatedSource.asObservable();
        this.imageSelectedIndexUpdated$ = this.imageSelectedIndexUpdatedSource.asObservable();
        this.showImageViewerChanged$ = this.showImageViewerSource.asObservable();
    }
    updateImages(images) {
        this.imagesUpdatedSource.next(images);
    }
    updateSelectedImageIndex(newIndex) {
        this.imageSelectedIndexUpdatedSource.next(newIndex);
    }
    showImageViewer(show) {
        this.showImageViewerSource.next(show);
    }
}
ImageService.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ImageService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
ImageService.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ImageService });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ImageService, decorators: [{
            type: Injectable
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXIyLWltYWdlLWdhbGxlcnkvc3JjL2xpYi9zZXJ2aWNlcy9pbWFnZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFDMUMsT0FBTyxFQUFjLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQTs7QUFJMUMsTUFBTSxPQUFPLFlBQVk7SUFEekI7UUFFVSx3QkFBbUIsR0FBRyxJQUFJLE9BQU8sRUFBbUIsQ0FBQTtRQUNwRCxvQ0FBK0IsR0FBRyxJQUFJLE9BQU8sRUFBVSxDQUFBO1FBQ3ZELDBCQUFxQixHQUFHLElBQUksT0FBTyxFQUFXLENBQUE7UUFFdEQsbUJBQWMsR0FBZ0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3JGLCtCQUEwQixHQUF1QixJQUFJLENBQUMsK0JBQStCLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDcEcsNEJBQXVCLEdBQXdCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtLQWF6RjtJQVhDLFlBQVksQ0FBQyxNQUF1QjtRQUNsQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZDLENBQUM7SUFFRCx3QkFBd0IsQ0FBQyxRQUFnQjtRQUN2QyxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3JELENBQUM7SUFFRCxlQUFlLENBQUMsSUFBYTtRQUMzQixJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3ZDLENBQUM7O3lHQW5CVSxZQUFZOzZHQUFaLFlBQVk7MkZBQVosWUFBWTtrQkFEeEIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnXG5pbXBvcnQgeyBJbWFnZU1ldGFkYXRhIH0gZnJvbSAnLi4vZGF0YS9pbWFnZS1tZXRhZGF0YSdcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEltYWdlU2VydmljZSB7XG4gIHByaXZhdGUgaW1hZ2VzVXBkYXRlZFNvdXJjZSA9IG5ldyBTdWJqZWN0PEltYWdlTWV0YWRhdGFbXT4oKVxuICBwcml2YXRlIGltYWdlU2VsZWN0ZWRJbmRleFVwZGF0ZWRTb3VyY2UgPSBuZXcgU3ViamVjdDxudW1iZXI+KClcbiAgcHJpdmF0ZSBzaG93SW1hZ2VWaWV3ZXJTb3VyY2UgPSBuZXcgU3ViamVjdDxib29sZWFuPigpXG5cbiAgaW1hZ2VzVXBkYXRlZCQ6IE9ic2VydmFibGU8SW1hZ2VNZXRhZGF0YVtdPiA9IHRoaXMuaW1hZ2VzVXBkYXRlZFNvdXJjZS5hc09ic2VydmFibGUoKVxuICBpbWFnZVNlbGVjdGVkSW5kZXhVcGRhdGVkJDogT2JzZXJ2YWJsZTxudW1iZXI+ID0gdGhpcy5pbWFnZVNlbGVjdGVkSW5kZXhVcGRhdGVkU291cmNlLmFzT2JzZXJ2YWJsZSgpXG4gIHNob3dJbWFnZVZpZXdlckNoYW5nZWQkOiBPYnNlcnZhYmxlPGJvb2xlYW4+ID0gdGhpcy5zaG93SW1hZ2VWaWV3ZXJTb3VyY2UuYXNPYnNlcnZhYmxlKClcblxuICB1cGRhdGVJbWFnZXMoaW1hZ2VzOiBJbWFnZU1ldGFkYXRhW10pOiB2b2lkIHtcbiAgICB0aGlzLmltYWdlc1VwZGF0ZWRTb3VyY2UubmV4dChpbWFnZXMpXG4gIH1cblxuICB1cGRhdGVTZWxlY3RlZEltYWdlSW5kZXgobmV3SW5kZXg6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuaW1hZ2VTZWxlY3RlZEluZGV4VXBkYXRlZFNvdXJjZS5uZXh0KG5ld0luZGV4KVxuICB9XG5cbiAgc2hvd0ltYWdlVmlld2VyKHNob3c6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnNob3dJbWFnZVZpZXdlclNvdXJjZS5uZXh0KHNob3cpXG4gIH1cbn1cbiJdfQ==