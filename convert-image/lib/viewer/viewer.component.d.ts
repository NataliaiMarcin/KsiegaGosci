import { ImageService } from '../services/image.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageMetadata } from '../data/image-metadata';
import * as i0 from "@angular/core";
export declare class ViewerComponent {
    private imageService;
    private sanitizer;
    showViewer: boolean;
    images: Array<ImageMetadata>;
    currentIdx: number;
    leftArrowVisible: boolean;
    rightArrowVisible: boolean;
    categorySelected: string;
    transform: number;
    math: Math;
    private qualitySelectorShown;
    private qualitySelected;
    constructor(imageService: ImageService, sanitizer: DomSanitizer);
    get leftArrowActive(): boolean;
    get rightArrowActive(): boolean;
    pan(swipe: any): void;
    onResize(): void;
    showQualitySelector(): void;
    qualityChanged(newQuality: any): void;
    imageLoaded(image: any): void;
    /**
     * direction (-1: left, 1: right)
     * swipe (user swiped)
     */
    navigate(direction: number, swipe: any): void;
    showNavigationArrows(): void;
    closeViewer(): void;
    onKeydown(event: KeyboardEvent): void;
    sanitizedImageUrl(img: any, index: number): import("@angular/platform-browser").SafeStyle;
    private rawImageUrl;
    private hideNavigationArrows;
    private updateImage;
    private updateQuality;
    static ɵfac: i0.ɵɵFactoryDeclaration<ViewerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<ViewerComponent, "viewer", never, {}, {}, never, never, false, never>;
}
