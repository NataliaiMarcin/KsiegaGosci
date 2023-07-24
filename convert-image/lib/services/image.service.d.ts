import { Observable } from 'rxjs';
import { ImageMetadata } from '../data/image-metadata';
import * as i0 from "@angular/core";
export declare class ImageService {
    private imagesUpdatedSource;
    private imageSelectedIndexUpdatedSource;
    private showImageViewerSource;
    imagesUpdated$: Observable<ImageMetadata[]>;
    imageSelectedIndexUpdated$: Observable<number>;
    showImageViewerChanged$: Observable<boolean>;
    updateImages(images: ImageMetadata[]): void;
    updateSelectedImageIndex(newIndex: number): void;
    showImageViewer(show: boolean): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<ImageService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<ImageService>;
}
