import { ChangeDetectorRef, ElementRef, EventEmitter, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { HttpClient } from '@angular/common/http';
import { ImageMetadata } from '../data/image-metadata';
import * as i0 from "@angular/core";
export declare class GalleryComponent implements OnInit, OnDestroy, OnChanges {
    imageService: ImageService;
    http: HttpClient;
    changeDetectorRef: ChangeDetectorRef;
    gallery: any[];
    imageDataStaticPath: string;
    imageMetadataUri: string;
    dataFileName: string;
    images: ImageMetadata[];
    minimalQualityCategory: string;
    viewerSubscription: Subscription;
    rowIndex: number;
    rightArrowInactive: boolean;
    leftArrowInactive: boolean;
    providedImageMargin: number;
    providedImageSize: number;
    providedGalleryName: string;
    providedMetadataUri: string;
    rowsPerPage: number;
    includeViewer: boolean;
    lazyLoadGalleryImages: boolean;
    viewerChange: EventEmitter<boolean>;
    galleryContainer: ElementRef;
    imageElements: QueryList<any>;
    triggerCycle(_: any): void;
    windowResize(_: any): void;
    constructor(imageService: ImageService, http: HttpClient, changeDetectorRef: ChangeDetectorRef);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    openImageViewer(img: any): void;
    /**
     * direction (-1: left, 1: right)
     */
    navigate(direction: number): void;
    calcImageMargin(): number;
    private fetchDataAndRender;
    private handleErrorWhenLoadingImages;
    private determineMetadataPath;
    private render;
    private shouldAddCandidate;
    private calcRowHeight;
    private calcOriginalRowWidth;
    private isPaginationActive;
    private calcIdealHeight;
    private getGalleryWidth;
    private isLastRow;
    private scaleGallery;
    private loadImagesInsideView;
    private isScrolledIntoView;
    private refreshArrowState;
    static ɵfac: i0.ɵɵFactoryDeclaration<GalleryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<GalleryComponent, "gallery", never, { "providedImageMargin": "flexBorderSize"; "providedImageSize": "flexImageSize"; "providedGalleryName": "galleryName"; "providedMetadataUri": "metadataUri"; "rowsPerPage": "maxRowsPerPage"; "includeViewer": "includeViewer"; "lazyLoadGalleryImages": "lazyLoadGalleryImages"; }, { "viewerChange": "viewerChange"; }, never, never, false, never>;
}
