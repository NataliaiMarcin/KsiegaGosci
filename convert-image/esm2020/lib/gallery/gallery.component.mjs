import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren, } from '@angular/core';
import { ImageService } from '../services/image.service';
import { HttpClient } from '@angular/common/http';
import * as i0 from "@angular/core";
import * as i1 from "../services/image.service";
import * as i2 from "@angular/common/http";
import * as i3 from "@angular/common";
import * as i4 from "../viewer/viewer.component";
export class GalleryComponent {
    triggerCycle(_) {
        this.loadImagesInsideView();
    }
    windowResize(_) {
        this.render();
    }
    constructor(imageService, http, changeDetectorRef) {
        this.imageService = imageService;
        this.http = http;
        this.changeDetectorRef = changeDetectorRef;
        this.gallery = [];
        this.imageDataStaticPath = 'assets/img/gallery/';
        this.imageMetadataUri = '';
        this.dataFileName = 'data.json';
        this.images = [];
        this.minimalQualityCategory = 'preview_xxs';
        this.rowIndex = 0;
        this.rightArrowInactive = false;
        this.leftArrowInactive = false;
        this.providedImageMargin = 3;
        this.providedImageSize = 7;
        this.providedGalleryName = '';
        this.providedMetadataUri = undefined;
        this.rowsPerPage = 200;
        this.includeViewer = true;
        this.lazyLoadGalleryImages = true;
        this.viewerChange = new EventEmitter();
        this.handleErrorWhenLoadingImages = (err) => {
            if (this.providedMetadataUri) {
                console.error(`Provided endpoint '${this.providedMetadataUri}' did not serve metadata correctly or in the expected format.
      See here for more information: https://github.com/BenjaminBrandmeier/angular2-image-gallery/blob/master/docs/externalDataSource.md,
      Original error: ${err}`);
            }
            else {
                console.error(`Did you run the convert script from angular2-image-gallery for your images first? Original error: ${err}`);
            }
        };
        this.isPaginationActive = () => !this.rightArrowInactive || !this.leftArrowInactive;
        this.calcIdealHeight = () => this.getGalleryWidth() / (80 / this.providedImageSize) + 100;
        this.getGalleryWidth = () => this.galleryContainer.nativeElement.clientWidth;
        this.isLastRow = (imgRow) => imgRow === this.gallery[this.gallery.length - 1];
    }
    ngOnInit() {
        this.fetchDataAndRender();
        this.viewerSubscription = this.imageService.showImageViewerChanged$.subscribe((visibility) => this.viewerChange.emit(visibility));
    }
    ngOnChanges(changes) {
        // input params changed
        this.imageMetadataUri = this.determineMetadataPath();
        if (!changes['providedGalleryName']?.isFirstChange()) {
            this.fetchDataAndRender();
        }
        this.render();
    }
    ngOnDestroy() {
        if (this.viewerSubscription) {
            this.viewerSubscription.unsubscribe();
        }
    }
    openImageViewer(img) {
        this.imageService.updateImages(this.images);
        this.imageService.updateSelectedImageIndex(this.images.indexOf(img));
        this.imageService.showImageViewer(true);
    }
    /**
     * direction (-1: left, 1: right)
     */
    navigate(direction) {
        if ((direction === 1 && this.rowIndex < this.gallery.length - this.rowsPerPage) || (direction === -1 && this.rowIndex > 0)) {
            this.rowIndex += this.rowsPerPage * direction;
        }
        this.refreshArrowState();
        this.render();
    }
    calcImageMargin() {
        const galleryWidth = this.getGalleryWidth();
        const ratio = galleryWidth / 1920;
        return Math.round(Math.max(1, this.providedImageMargin * ratio));
    }
    fetchDataAndRender() {
        this.http.get(this.imageMetadataUri).subscribe((data) => {
            this.images = data;
            this.imageService.updateImages(this.images);
            this.images.forEach((image) => {
                image['viewerImageLoaded'] = false;
                image['srcAfterFocus'] = '';
            });
            this.render();
        }, this.handleErrorWhenLoadingImages);
    }
    determineMetadataPath() {
        let imageMetadataUri = this.providedMetadataUri;
        if (!this.providedMetadataUri) {
            imageMetadataUri =
                this.providedGalleryName !== ''
                    ? `${this.imageDataStaticPath + this.providedGalleryName}/${this.dataFileName}`
                    : this.imageDataStaticPath + this.dataFileName;
        }
        return imageMetadataUri;
    }
    render() {
        this.gallery = [];
        let tempRow = [this.images[0]];
        let currentRowIndex = 0;
        let i = 0;
        for (i; i < this.images.length; i++) {
            while (this.images[i + 1] && this.shouldAddCandidate(tempRow, this.images[i + 1])) {
                i++;
            }
            if (this.images[i + 1]) {
                tempRow.pop();
            }
            this.gallery[currentRowIndex++] = tempRow;
            tempRow = [this.images[i + 1]];
        }
        this.scaleGallery();
    }
    shouldAddCandidate(imgRow, candidate) {
        const oldDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        imgRow.push(candidate);
        const newDifference = this.calcIdealHeight() - this.calcRowHeight(imgRow);
        return Math.abs(oldDifference) > Math.abs(newDifference);
    }
    calcRowHeight(imgRow) {
        const originalRowWidth = this.calcOriginalRowWidth(imgRow);
        const ratio = (this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin()) / originalRowWidth;
        const rowHeight = imgRow[0].resolutions[this.minimalQualityCategory].height * ratio;
        return rowHeight;
    }
    calcOriginalRowWidth(imgRow) {
        let originalRowWidth = 0;
        imgRow.forEach((img) => {
            const individualRatio = this.calcIdealHeight() / img.resolutions[this.minimalQualityCategory].height;
            img.resolutions[this.minimalQualityCategory].width = img.resolutions[this.minimalQualityCategory].width * individualRatio;
            img.resolutions[this.minimalQualityCategory].height = this.calcIdealHeight();
            originalRowWidth += img.resolutions[this.minimalQualityCategory].width;
        });
        return originalRowWidth;
    }
    scaleGallery() {
        let maximumGalleryImageHeight = 0;
        this.gallery.slice(this.rowIndex, this.rowIndex + this.rowsPerPage).forEach((imgRow) => {
            const originalRowWidth = this.calcOriginalRowWidth(imgRow);
            const calculatedRowWidth = this.getGalleryWidth() - (imgRow.length - 1) * this.calcImageMargin();
            const ratio = this.isLastRow(imgRow) ? 1 : calculatedRowWidth / originalRowWidth;
            imgRow.forEach((img) => {
                img.width = img.resolutions[this.minimalQualityCategory].width * ratio;
                img.height = img.resolutions[this.minimalQualityCategory].height * ratio;
                maximumGalleryImageHeight = Math.max(maximumGalleryImageHeight, img.height);
            });
        });
        this.minimalQualityCategory = maximumGalleryImageHeight > 375 ? 'preview_xs' : 'preview_xxs';
        this.refreshArrowState();
        this.loadImagesInsideView();
    }
    loadImagesInsideView() {
        this.changeDetectorRef.detectChanges();
        this.images.forEach((image, index) => {
            const imageElements = this.imageElements.toArray();
            if (this.isPaginationActive() || this.isScrolledIntoView(imageElements[index]?.nativeElement) || !this.lazyLoadGalleryImages) {
                image['srcAfterFocus'] = image.resolutions[this.minimalQualityCategory].path;
            }
        });
    }
    isScrolledIntoView(element) {
        if (!element) {
            return false;
        }
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const viewableHeight = document.documentElement.clientHeight;
        return elementTop < viewableHeight && elementBottom >= 0;
    }
    refreshArrowState() {
        this.leftArrowInactive = this.rowIndex == 0;
        this.rightArrowInactive = this.rowIndex >= this.gallery.length - this.rowsPerPage;
    }
}
GalleryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: GalleryComponent, deps: [{ token: i1.ImageService }, { token: i2.HttpClient }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
GalleryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.1.1", type: GalleryComponent, selector: "gallery", inputs: { providedImageMargin: ["flexBorderSize", "providedImageMargin"], providedImageSize: ["flexImageSize", "providedImageSize"], providedGalleryName: ["galleryName", "providedGalleryName"], providedMetadataUri: ["metadataUri", "providedMetadataUri"], rowsPerPage: ["maxRowsPerPage", "rowsPerPage"], includeViewer: "includeViewer", lazyLoadGalleryImages: "lazyLoadGalleryImages" }, outputs: { viewerChange: "viewerChange" }, host: { listeners: { "window:scroll": "triggerCycle($event)", "resize": "windowResize($event)" } }, viewQueries: [{ propertyName: "galleryContainer", first: true, predicate: ["galleryContainer"], descendants: true, static: true }, { propertyName: "imageElements", predicate: ["imageElement"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div #galleryContainer class=\"galleryContainer\">\n  <div class=\"innerGalleryContainer\">\n    <div\n      *ngFor=\"let imgrow of gallery | slice: rowIndex:rowIndex + rowsPerPage; let i = index\"\n      class=\"imagerow\"\n      [style.margin-bottom.px]=\"calcImageMargin()\">\n      <img\n        #imageElement\n        *ngFor=\"let img of imgrow; let j = index\"\n        class=\"thumbnail\"\n        [style.width.px]=\"img['width']\"\n        [style.height.px]=\"img['height']\"\n        (click)=\"openImageViewer(img)\"\n        [src]=\"img['srcAfterFocus']\"\n        [style.background]=\"img.dominantColor\"\n        [style.margin-right.px]=\"calcImageMargin()\" />\n    </div>\n  </div>\n\n  <div class=\"pagerContainer\" *ngIf=\"!rightArrowInactive || !leftArrowInactive\">\n    <img\n      [ngClass]=\"{ inactive: leftArrowInactive }\"\n      class=\"pager left\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNGMwLDExLDksMjAsMjAsMjAgICBjMTEsMCwyMC05LDIwLTIwQzQ0LDEzLDM1LDQsMjQsNHoiLz48L2c+PGc+PHBvbHlnb24gcG9pbnRzPSIyNy42LDM2LjcgMTQuOSwyNCAyNy42LDExLjMgMjkuMSwxMi43IDE3LjgsMjQgMjkuMSwzNS4zICAiLz48L2c+PC9zdmc+\"\n      (click)=\"navigate(-1)\" />\n    <img\n      [ngClass]=\"{ inactive: rightArrowInactive }\"\n      class=\"pager right\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNHM5LDIwLDIwLDIwczIwLTksMjAtMjAgICBTMzUsNCwyNCw0eiIvPjwvZz48Zz48cG9seWdvbiBwb2ludHM9IjIxLjQsMzYuNyAxOS45LDM1LjMgMzEuMiwyNCAxOS45LDEyLjcgMjEuNCwxMS4zIDM0LjEsMjQgICIvPjwvZz48L3N2Zz4=\"\n      (click)=\"navigate(1)\" />\n  </div>\n</div>\n\n<viewer *ngIf=\"includeViewer\"></viewer>\n", styles: [".innerGalleryContainer{position:relative}.galleryContainer{height:100%;width:100%;overflow:hidden}.innerGalleryContainer img:last-child{margin-right:-1px!important}.galleryContainer img:hover{filter:brightness(50%);transition:all ease-out .2s;cursor:pointer}.imagerow{margin-right:1px;overflow:hidden;display:flex}::-webkit-scrollbar{display:none}.asyncLoadingContainer{position:absolute;background-color:transparent;height:0px;width:0px;bottom:120px}.pagerContainer{margin:40px auto;width:180px}@media (max-width: 700px){.pagerContainer{margin:40px auto;width:150px}}.pager{display:block;height:60px}@media (max-width: 700px){.pager{display:block;height:45px}}.pager.inactive{opacity:.15;cursor:default}.pager.left{float:left}.pager.right{float:right}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: i4.ViewerComponent, selector: "viewer" }, { kind: "pipe", type: i3.SlicePipe, name: "slice" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: GalleryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'gallery', template: "<div #galleryContainer class=\"galleryContainer\">\n  <div class=\"innerGalleryContainer\">\n    <div\n      *ngFor=\"let imgrow of gallery | slice: rowIndex:rowIndex + rowsPerPage; let i = index\"\n      class=\"imagerow\"\n      [style.margin-bottom.px]=\"calcImageMargin()\">\n      <img\n        #imageElement\n        *ngFor=\"let img of imgrow; let j = index\"\n        class=\"thumbnail\"\n        [style.width.px]=\"img['width']\"\n        [style.height.px]=\"img['height']\"\n        (click)=\"openImageViewer(img)\"\n        [src]=\"img['srcAfterFocus']\"\n        [style.background]=\"img.dominantColor\"\n        [style.margin-right.px]=\"calcImageMargin()\" />\n    </div>\n  </div>\n\n  <div class=\"pagerContainer\" *ngIf=\"!rightArrowInactive || !leftArrowInactive\">\n    <img\n      [ngClass]=\"{ inactive: leftArrowInactive }\"\n      class=\"pager left\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNGMwLDExLDksMjAsMjAsMjAgICBjMTEsMCwyMC05LDIwLTIwQzQ0LDEzLDM1LDQsMjQsNHoiLz48L2c+PGc+PHBvbHlnb24gcG9pbnRzPSIyNy42LDM2LjcgMTQuOSwyNCAyNy42LDExLjMgMjkuMSwxMi43IDE3LjgsMjQgMjkuMSwzNS4zICAiLz48L2c+PC9zdmc+\"\n      (click)=\"navigate(-1)\" />\n    <img\n      [ngClass]=\"{ inactive: rightArrowInactive }\"\n      class=\"pager right\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNHM5LDIwLDIwLDIwczIwLTksMjAtMjAgICBTMzUsNCwyNCw0eiIvPjwvZz48Zz48cG9seWdvbiBwb2ludHM9IjIxLjQsMzYuNyAxOS45LDM1LjMgMzEuMiwyNCAxOS45LDEyLjcgMjEuNCwxMS4zIDM0LjEsMjQgICIvPjwvZz48L3N2Zz4=\"\n      (click)=\"navigate(1)\" />\n  </div>\n</div>\n\n<viewer *ngIf=\"includeViewer\"></viewer>\n", styles: [".innerGalleryContainer{position:relative}.galleryContainer{height:100%;width:100%;overflow:hidden}.innerGalleryContainer img:last-child{margin-right:-1px!important}.galleryContainer img:hover{filter:brightness(50%);transition:all ease-out .2s;cursor:pointer}.imagerow{margin-right:1px;overflow:hidden;display:flex}::-webkit-scrollbar{display:none}.asyncLoadingContainer{position:absolute;background-color:transparent;height:0px;width:0px;bottom:120px}.pagerContainer{margin:40px auto;width:180px}@media (max-width: 700px){.pagerContainer{margin:40px auto;width:150px}}.pager{display:block;height:60px}@media (max-width: 700px){.pager{display:block;height:45px}}.pager.inactive{opacity:.15;cursor:default}.pager.left{float:left}.pager.right{float:right}\n"] }]
        }], ctorParameters: function () { return [{ type: i1.ImageService }, { type: i2.HttpClient }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { providedImageMargin: [{
                type: Input,
                args: ['flexBorderSize']
            }], providedImageSize: [{
                type: Input,
                args: ['flexImageSize']
            }], providedGalleryName: [{
                type: Input,
                args: ['galleryName']
            }], providedMetadataUri: [{
                type: Input,
                args: ['metadataUri']
            }], rowsPerPage: [{
                type: Input,
                args: ['maxRowsPerPage']
            }], includeViewer: [{
                type: Input,
                args: ['includeViewer']
            }], lazyLoadGalleryImages: [{
                type: Input,
                args: ['lazyLoadGalleryImages']
            }], viewerChange: [{
                type: Output
            }], galleryContainer: [{
                type: ViewChild,
                args: ['galleryContainer', { static: true }]
            }], imageElements: [{
                type: ViewChildren,
                args: ['imageElement']
            }], triggerCycle: [{
                type: HostListener,
                args: ['window:scroll', ['$event']]
            }], windowResize: [{
                type: HostListener,
                args: ['resize', ['$event']]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FsbGVyeS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyMi1pbWFnZS1nYWxsZXJ5L3NyYy9saWIvZ2FsbGVyeS9nYWxsZXJ5LmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXIyLWltYWdlLWdhbGxlcnkvc3JjL2xpYi9nYWxsZXJ5L2dhbGxlcnkuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixZQUFZLEVBQ1osS0FBSyxFQUlMLE1BQU0sRUFDTixTQUFTLEVBRVQsU0FBUyxFQUNULFlBQVksR0FDYixNQUFNLGVBQWUsQ0FBQTtBQUN0QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFFeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFBOzs7Ozs7QUFRakQsTUFBTSxPQUFPLGdCQUFnQjtJQXlCZ0IsWUFBWSxDQUFDLENBQU07UUFDNUQsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7SUFDN0IsQ0FBQztJQUVtQyxZQUFZLENBQUMsQ0FBTTtRQUNyRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDZixDQUFDO0lBRUQsWUFBbUIsWUFBMEIsRUFBUyxJQUFnQixFQUFTLGlCQUFvQztRQUFoRyxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUFTLFNBQUksR0FBSixJQUFJLENBQVk7UUFBUyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1FBaENuSCxZQUFPLEdBQVUsRUFBRSxDQUFBO1FBQ25CLHdCQUFtQixHQUFXLHFCQUFxQixDQUFBO1FBQ25ELHFCQUFnQixHQUFXLEVBQUUsQ0FBQTtRQUM3QixpQkFBWSxHQUFXLFdBQVcsQ0FBQTtRQUNsQyxXQUFNLEdBQW9CLEVBQUUs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QVk7c0JBQXJCLE1BQU07Z0JBRTBDLGdCQUFnQjtzQkFBaEUsU0FBUzt1QkFBQyxrQkFBa0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7Z0JBQ2pCLGFBQWE7c0JBQTFDLFlBQVk7dUJBQUMsY0FBYztnQkFFZSxZQUFZO3NCQUF0RCxZQUFZO3VCQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQztnQkFJTCxZQUFZO3NCQUEvQyxZQUFZO3VCQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgT3V0cHV0LFxuICBRdWVyeUxpc3QsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0NoaWxkcmVuLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHsgSW1hZ2VTZXJ2aWNlIH0gZnJvbSAnLi4vc2VydmljZXMvaW1hZ2Uuc2VydmljZSdcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMvaW50ZXJuYWwvU3Vic2NyaXB0aW9uJ1xuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJ1xuaW1wb3J0IHsgSW1hZ2VNZXRhZGF0YSB9IGZyb20gJy4uL2RhdGEvaW1hZ2UtbWV0YWRhdGEnXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2dhbGxlcnknLFxuICB0ZW1wbGF0ZVVybDogJy4vZ2FsbGVyeS5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL2dhbGxlcnkuY29tcG9uZW50LnNhc3MnXSxcbn0pXG5leHBvcnQgY2xhc3MgR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMge1xuICBnYWxsZXJ5OiBhbnlbXSA9IFtdXG4gIGltYWdlRGF0YVN0YXRpY1BhdGg6IHN0cmluZyA9ICdhc3NldHMvaW1nL2dhbGxlcnkvJ1xuICBpbWFnZU1ldGFkYXRhVXJpOiBzdHJpbmcgPSAnJ1xuICBkYXRhRmlsZU5hbWU6IHN0cmluZyA9ICdkYXRhLmpzb24nXG4gIGltYWdlczogSW1hZ2VNZXRhZGF0YVtdID0gW11cbiAgbWluaW1hbFF1YWxpdHlDYXRlZ29yeSA9ICdwcmV2aWV3X3h4cydcbiAgdmlld2VyU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb25cbiAgcm93SW5kZXg6IG51bWJlciA9IDBcbiAgcmlnaHRBcnJvd0luYWN0aXZlOiBib29sZWFuID0gZmFsc2VcbiAgbGVmdEFycm93SW5hY3RpdmU6IGJvb2xlYW4gPSBmYWxzZVxuXG4gIEBJbnB1dCgnZmxleEJvcmRlclNpemUnKSBwcm92aWRlZEltYWdlTWFyZ2luOiBudW1iZXIgPSAzXG4gIEBJbnB1dCgnZmxleEltYWdlU2l6ZScpIHByb3ZpZGVkSW1hZ2VTaXplOiBudW1iZXIgPSA3XG4gIEBJbnB1dCgnZ2FsbGVyeU5hbWUnKSBwcm92aWRlZEdhbGxlcnlOYW1lOiBzdHJpbmcgPSAnJ1xuICBASW5wdXQoJ21ldGFkYXRhVXJpJykgcHJvdmlkZWRNZXRhZGF0YVVyaTogc3RyaW5nID0gdW5kZWZpbmVkXG4gIEBJbnB1dCgnbWF4Um93c1BlclBhZ2UnKSByb3dzUGVyUGFnZTogbnVtYmVyID0gMjAwXG4gIEBJbnB1dCgnaW5jbHVkZVZpZXdlcicpIGluY2x1ZGVWaWV3ZXIgPSB0cnVlXG4gIEBJbnB1dCgnbGF6eUxvYWRHYWxsZXJ5SW1hZ2VzJykgbGF6eUxvYWRHYWxsZXJ5SW1hZ2VzID0gdHJ1ZVxuXG4gIEBPdXRwdXQoKSB2aWV3ZXJDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGJvb2xlYW4+KClcblxuICBAVmlld0NoaWxkKCdnYWxsZXJ5Q29udGFpbmVyJywgeyBzdGF0aWM6IHRydWUgfSkgZ2FsbGVyeUNvbnRhaW5lcjogRWxlbWVudFJlZlxuICBAVmlld0NoaWxkcmVuKCdpbWFnZUVsZW1lbnQnKSBpbWFnZUVsZW1lbnRzOiBRdWVyeUxpc3Q8YW55PlxuXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzpzY3JvbGwnLCBbJyRldmVudCddKSB0cmlnZ2VyQ3ljbGUoXzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5sb2FkSW1hZ2VzSW5zaWRlVmlldygpXG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdyZXNpemUnLCBbJyRldmVudCddKSB3aW5kb3dSZXNpemUoXzogYW55KTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXIoKVxuICB9XG5cbiAgY29uc3RydWN0b3IocHVibGljIGltYWdlU2VydmljZTogSW1hZ2VTZXJ2aWNlLCBwdWJsaWMgaHR0cDogSHR0cENsaWVudCwgcHVibGljIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZikge31cblxuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICB0aGlzLmZldGNoRGF0YUFuZFJlbmRlcigpXG4gICAgdGhpcy52aWV3ZXJTdWJzY3JpcHRpb24gPSB0aGlzLmltYWdlU2VydmljZS5zaG93SW1hZ2VWaWV3ZXJDaGFuZ2VkJC5zdWJzY3JpYmUoKHZpc2liaWxpdHk6IGJvb2xlYW4pID0+XG4gICAgICB0aGlzLnZpZXdlckNoYW5nZS5lbWl0KHZpc2liaWxpdHkpXG4gICAgKVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIC8vIGlucHV0IHBhcmFtcyBjaGFuZ2VkXG4gICAgdGhpcy5pbWFnZU1ldGFkYXRhVXJpID0gdGhpcy5kZXRlcm1pbmVNZXRhZGF0YVBhdGgoKVxuXG4gICAgaWYgKCFjaGFuZ2VzWydwcm92aWRlZEdhbGxlcnlOYW1lJ10/LmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgdGhpcy5mZXRjaERhdGFBbmRSZW5kZXIoKVxuICAgIH1cblxuICAgIHRoaXMucmVuZGVyKClcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnZpZXdlclN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy52aWV3ZXJTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKVxuICAgIH1cbiAgfVxuXG4gIG9wZW5JbWFnZVZpZXdlcihpbWc6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuaW1hZ2VTZXJ2aWNlLnVwZGF0ZUltYWdlcyh0aGlzLmltYWdlcylcbiAgICB0aGlzLmltYWdlU2VydmljZS51cGRhdGVTZWxlY3RlZEltYWdlSW5kZXgodGhpcy5pbWFnZXMuaW5kZXhPZihpbWcpKVxuICAgIHRoaXMuaW1hZ2VTZXJ2aWNlLnNob3dJbWFnZVZpZXdlcih0cnVlKVxuICB9XG5cbiAgLyoqXG4gICAqIGRpcmVjdGlvbiAoLTE6IGxlZnQsIDE6IHJpZ2h0KVxuICAgKi9cbiAgbmF2aWdhdGUoZGlyZWN0aW9uOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoKGRpcmVjdGlvbiA9PT0gMSAmJiB0aGlzLnJvd0luZGV4IDwgdGhpcy5nYWxsZXJ5Lmxlbmd0aCAtIHRoaXMucm93c1BlclBhZ2UpIHx8IChkaXJlY3Rpb24gPT09IC0xICYmIHRoaXMucm93SW5kZXggPiAwKSkge1xuICAgICAgdGhpcy5yb3dJbmRleCArPSB0aGlzLnJvd3NQZXJQYWdlICogZGlyZWN0aW9uXG4gICAgfVxuICAgIHRoaXMucmVmcmVzaEFycm93U3RhdGUoKVxuICAgIHRoaXMucmVuZGVyKClcbiAgfVxuXG4gIGNhbGNJbWFnZU1hcmdpbigpOiBudW1iZXIge1xuICAgIGNvbnN0IGdhbGxlcnlXaWR0aCA9IHRoaXMuZ2V0R2FsbGVyeVdpZHRoKClcbiAgICBjb25zdCByYXRpbyA9IGdhbGxlcnlXaWR0aCAvIDE5MjBcbiAgICByZXR1cm4gTWF0aC5yb3VuZChNYXRoLm1heCgxLCB0aGlzLnByb3ZpZGVkSW1hZ2VNYXJnaW4gKiByYXRpbykpXG4gIH1cblxuICBwcml2YXRlIGZldGNoRGF0YUFuZFJlbmRlcigpOiB2b2lkIHtcbiAgICB0aGlzLmh0dHAuZ2V0KHRoaXMuaW1hZ2VNZXRhZGF0YVVyaSkuc3Vic2NyaWJlKChkYXRhOiBJbWFnZU1ldGFkYXRhW10pID0+IHtcbiAgICAgIHRoaXMuaW1hZ2VzID0gZGF0YVxuICAgICAgdGhpcy5pbWFnZVNlcnZpY2UudXBkYXRlSW1hZ2VzKHRoaXMuaW1hZ2VzKVxuXG4gICAgICB0aGlzLmltYWdlcy5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICBpbWFnZVsndmlld2VySW1hZ2VMb2FkZWQnXSA9IGZhbHNlXG4gICAgICAgIGltYWdlWydzcmNBZnRlckZvY3VzJ10gPSAnJ1xuICAgICAgfSlcblxuICAgICAgdGhpcy5yZW5kZXIoKVxuICAgIH0sIHRoaXMuaGFuZGxlRXJyb3JXaGVuTG9hZGluZ0ltYWdlcylcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRXJyb3JXaGVuTG9hZGluZ0ltYWdlcyA9IChlcnIpID0+IHtcbiAgICBpZiAodGhpcy5wcm92aWRlZE1ldGFkYXRhVXJpKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBQcm92aWRlZCBlbmRwb2ludCAnJHt0aGlzLnByb3ZpZGVkTWV0YWRhdGFVcml9JyBkaWQgbm90IHNlcnZlIG1ldGFkYXRhIGNvcnJlY3RseSBvciBpbiB0aGUgZXhwZWN0ZWQgZm9ybWF0LlxuICAgICAgU2VlIGhlcmUgZm9yIG1vcmUgaW5mb3JtYXRpb246IGh0dHBzOi8vZ2l0aHViLmNvbS9CZW5qYW1pbkJyYW5kbWVpZXIvYW5ndWxhcjItaW1hZ2UtZ2FsbGVyeS9ibG9iL21hc3Rlci9kb2NzL2V4dGVybmFsRGF0YVNvdXJjZS5tZCxcbiAgICAgIE9yaWdpbmFsIGVycm9yOiAke2Vycn1gKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKGBEaWQgeW91IHJ1biB0aGUgY29udmVydCBzY3JpcHQgZnJvbSBhbmd1bGFyMi1pbWFnZS1nYWxsZXJ5IGZvciB5b3VyIGltYWdlcyBmaXJzdD8gT3JpZ2luYWwgZXJyb3I6ICR7ZXJyfWApXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkZXRlcm1pbmVNZXRhZGF0YVBhdGgoKSB7XG4gICAgbGV0IGltYWdlTWV0YWRhdGFVcmkgPSB0aGlzLnByb3ZpZGVkTWV0YWRhdGFVcmlcblxuICAgIGlmICghdGhpcy5wcm92aWRlZE1ldGFkYXRhVXJpKSB7XG4gICAgICBpbWFnZU1ldGFkYXRhVXJpID1cbiAgICAgICAgdGhpcy5wcm92aWRlZEdhbGxlcnlOYW1lICE9PSAnJ1xuICAgICAgICAgID8gYCR7dGhpcy5pbWFnZURhdGFTdGF0aWNQYXRoICsgdGhpcy5wcm92aWRlZEdhbGxlcnlOYW1lfS8ke3RoaXMuZGF0YUZpbGVOYW1lfWBcbiAgICAgICAgICA6IHRoaXMuaW1hZ2VEYXRhU3RhdGljUGF0aCArIHRoaXMuZGF0YUZpbGVOYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIGltYWdlTWV0YWRhdGFVcmlcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKCk6IHZvaWQge1xuICAgIHRoaXMuZ2FsbGVyeSA9IFtdXG5cbiAgICBsZXQgdGVtcFJvdyA9IFt0aGlzLmltYWdlc1swXV1cbiAgICBsZXQgY3VycmVudFJvd0luZGV4ID0gMFxuICAgIGxldCBpID0gMFxuXG4gICAgZm9yIChpOyBpIDwgdGhpcy5pbWFnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHdoaWxlICh0aGlzLmltYWdlc1tpICsgMV0gJiYgdGhpcy5zaG91bGRBZGRDYW5kaWRhdGUodGVtcFJvdywgdGhpcy5pbWFnZXNbaSArIDFdKSkge1xuICAgICAgICBpKytcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmltYWdlc1tpICsgMV0pIHtcbiAgICAgICAgdGVtcFJvdy5wb3AoKVxuICAgICAgfVxuICAgICAgdGhpcy5nYWxsZXJ5W2N1cnJlbnRSb3dJbmRleCsrXSA9IHRlbXBSb3dcblxuICAgICAgdGVtcFJvdyA9IFt0aGlzLmltYWdlc1tpICsgMV1dXG4gICAgfVxuXG4gICAgdGhpcy5zY2FsZUdhbGxlcnkoKVxuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRBZGRDYW5kaWRhdGUoaW1nUm93OiBhbnlbXSwgY2FuZGlkYXRlOiBhbnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBvbGREaWZmZXJlbmNlID0gdGhpcy5jYWxjSWRlYWxIZWlnaHQoKSAtIHRoaXMuY2FsY1Jvd0hlaWdodChpbWdSb3cpXG4gICAgaW1nUm93LnB1c2goY2FuZGlkYXRlKVxuICAgIGNvbnN0IG5ld0RpZmZlcmVuY2UgPSB0aGlzLmNhbGNJZGVhbEhlaWdodCgpIC0gdGhpcy5jYWxjUm93SGVpZ2h0KGltZ1JvdylcblxuICAgIHJldHVybiBNYXRoLmFicyhvbGREaWZmZXJlbmNlKSA+IE1hdGguYWJzKG5ld0RpZmZlcmVuY2UpXG4gIH1cblxuICBwcml2YXRlIGNhbGNSb3dIZWlnaHQoaW1nUm93OiBhbnlbXSk6IG51bWJlciB7XG4gICAgY29uc3Qgb3JpZ2luYWxSb3dXaWR0aCA9IHRoaXMuY2FsY09yaWdpbmFsUm93V2lkdGgoaW1nUm93KVxuXG4gICAgY29uc3QgcmF0aW8gPSAodGhpcy5nZXRHYWxsZXJ5V2lkdGgoKSAtIChpbWdSb3cubGVuZ3RoIC0gMSkgKiB0aGlzLmNhbGNJbWFnZU1hcmdpbigpKSAvIG9yaWdpbmFsUm93V2lkdGhcbiAgICBjb25zdCByb3dIZWlnaHQgPSBpbWdSb3dbMF0ucmVzb2x1dGlvbnNbdGhpcy5taW5pbWFsUXVhbGl0eUNhdGVnb3J5XS5oZWlnaHQgKiByYXRpb1xuXG4gICAgcmV0dXJuIHJvd0hlaWdodFxuICB9XG5cbiAgcHJpdmF0ZSBjYWxjT3JpZ2luYWxSb3dXaWR0aChpbWdSb3c6IGFueVtdKTogbnVtYmVyIHtcbiAgICBsZXQgb3JpZ2luYWxSb3dXaWR0aCA9IDBcbiAgICBpbWdSb3cuZm9yRWFjaCgoaW1nKSA9PiB7XG4gICAgICBjb25zdCBpbmRpdmlkdWFsUmF0aW8gPSB0aGlzLmNhbGNJZGVhbEhlaWdodCgpIC8gaW1nLnJlc29sdXRpb25zW3RoaXMubWluaW1hbFF1YWxpdHlDYXRlZ29yeV0uaGVpZ2h0XG4gICAgICBpbWcucmVzb2x1dGlvbnNbdGhpcy5taW5pbWFsUXVhbGl0eUNhdGVnb3J5XS53aWR0aCA9IGltZy5yZXNvbHV0aW9uc1t0aGlzLm1pbmltYWxRdWFsaXR5Q2F0ZWdvcnldLndpZHRoICogaW5kaXZpZHVhbFJhdGlvXG4gICAgICBpbWcucmVzb2x1dGlvbnNbdGhpcy5taW5pbWFsUXVhbGl0eUNhdGVnb3J5XS5oZWlnaHQgPSB0aGlzLmNhbGNJZGVhbEhlaWdodCgpXG4gICAgICBvcmlnaW5hbFJvd1dpZHRoICs9IGltZy5yZXNvbHV0aW9uc1t0aGlzLm1pbmltYWxRdWFsaXR5Q2F0ZWdvcnldLndpZHRoXG4gICAgfSlcblxuICAgIHJldHVybiBvcmlnaW5hbFJvd1dpZHRoXG4gIH1cblxuICBwcml2YXRlIGlzUGFnaW5hdGlvbkFjdGl2ZSA9ICgpID0+ICF0aGlzLnJpZ2h0QXJyb3dJbmFjdGl2ZSB8fCAhdGhpcy5sZWZ0QXJyb3dJbmFjdGl2ZVxuICBwcml2YXRlIGNhbGNJZGVhbEhlaWdodCA9ICgpOiBudW1iZXIgPT4gdGhpcy5nZXRHYWxsZXJ5V2lkdGgoKSAvICg4MCAvIHRoaXMucHJvdmlkZWRJbWFnZVNpemUpICsgMTAwXG4gIHByaXZhdGUgZ2V0R2FsbGVyeVdpZHRoID0gKCk6IG51bWJlciA9PiB0aGlzLmdhbGxlcnlDb250YWluZXIubmF0aXZlRWxlbWVudC5jbGllbnRXaWR0aFxuICBwcml2YXRlIGlzTGFzdFJvdyA9IChpbWdSb3cpID0+IGltZ1JvdyA9PT0gdGhpcy5nYWxsZXJ5W3RoaXMuZ2FsbGVyeS5sZW5ndGggLSAxXVxuXG4gIHByaXZhdGUgc2NhbGVHYWxsZXJ5KCk6IHZvaWQge1xuICAgIGxldCBtYXhpbXVtR2FsbGVyeUltYWdlSGVpZ2h0ID0gMFxuXG4gICAgdGhpcy5nYWxsZXJ5LnNsaWNlKHRoaXMucm93SW5kZXgsIHRoaXMucm93SW5kZXggKyB0aGlzLnJvd3NQZXJQYWdlKS5mb3JFYWNoKChpbWdSb3cpID0+IHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUm93V2lkdGggPSB0aGlzLmNhbGNPcmlnaW5hbFJvd1dpZHRoKGltZ1JvdylcbiAgICAgIGNvbnN0IGNhbGN1bGF0ZWRSb3dXaWR0aCA9IHRoaXMuZ2V0R2FsbGVyeVdpZHRoKCkgLSAoaW1nUm93Lmxlbmd0aCAtIDEpICogdGhpcy5jYWxjSW1hZ2VNYXJnaW4oKVxuXG4gICAgICBjb25zdCByYXRpbyA9IHRoaXMuaXNMYXN0Um93KGltZ1JvdykgPyAxIDogY2FsY3VsYXRlZFJvd1dpZHRoIC8gb3JpZ2luYWxSb3dXaWR0aFxuXG4gICAgICBpbWdSb3cuZm9yRWFjaCgoaW1nKSA9PiB7XG4gICAgICAgIGltZy53aWR0aCA9IGltZy5yZXNvbHV0aW9uc1t0aGlzLm1pbmltYWxRdWFsaXR5Q2F0ZWdvcnldLndpZHRoICogcmF0aW9cbiAgICAgICAgaW1nLmhlaWdodCA9IGltZy5yZXNvbHV0aW9uc1t0aGlzLm1pbmltYWxRdWFsaXR5Q2F0ZWdvcnldLmhlaWdodCAqIHJhdGlvXG4gICAgICAgIG1heGltdW1HYWxsZXJ5SW1hZ2VIZWlnaHQgPSBNYXRoLm1heChtYXhpbXVtR2FsbGVyeUltYWdlSGVpZ2h0LCBpbWcuaGVpZ2h0KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5taW5pbWFsUXVhbGl0eUNhdGVnb3J5ID0gbWF4aW11bUdhbGxlcnlJbWFnZUhlaWdodCA+IDM3NSA/ICdwcmV2aWV3X3hzJyA6ICdwcmV2aWV3X3h4cydcblxuICAgIHRoaXMucmVmcmVzaEFycm93U3RhdGUoKVxuICAgIHRoaXMubG9hZEltYWdlc0luc2lkZVZpZXcoKVxuICB9XG5cbiAgcHJpdmF0ZSBsb2FkSW1hZ2VzSW5zaWRlVmlldygpIHtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmLmRldGVjdENoYW5nZXMoKVxuXG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaCgoaW1hZ2U6IEltYWdlTWV0YWRhdGEsIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IGltYWdlRWxlbWVudHMgPSB0aGlzLmltYWdlRWxlbWVudHMudG9BcnJheSgpXG5cbiAgICAgIGlmICh0aGlzLmlzUGFnaW5hdGlvbkFjdGl2ZSgpIHx8IHRoaXMuaXNTY3JvbGxlZEludG9WaWV3KGltYWdlRWxlbWVudHNbaW5kZXhdPy5uYXRpdmVFbGVtZW50KSB8fCAhdGhpcy5sYXp5TG9hZEdhbGxlcnlJbWFnZXMpIHtcbiAgICAgICAgaW1hZ2VbJ3NyY0FmdGVyRm9jdXMnXSA9IGltYWdlLnJlc29sdXRpb25zW3RoaXMubWluaW1hbFF1YWxpdHlDYXRlZ29yeV0ucGF0aFxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGlzU2Nyb2xsZWRJbnRvVmlldyhlbGVtZW50OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIGlmICghZWxlbWVudCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRUb3AgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgIGNvbnN0IGVsZW1lbnRCb3R0b20gPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbVxuICAgIGNvbnN0IHZpZXdhYmxlSGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodFxuXG4gICAgcmV0dXJuIGVsZW1lbnRUb3AgPCB2aWV3YWJsZUhlaWdodCAmJiBlbGVtZW50Qm90dG9tID49IDBcbiAgfVxuXG4gIHByaXZhdGUgcmVmcmVzaEFycm93U3RhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5sZWZ0QXJyb3dJbmFjdGl2ZSA9IHRoaXMucm93SW5kZXggPT0gMFxuICAgIHRoaXMucmlnaHRBcnJvd0luYWN0aXZlID0gdGhpcy5yb3dJbmRleCA+PSB0aGlzLmdhbGxlcnkubGVuZ3RoIC0gdGhpcy5yb3dzUGVyUGFnZVxuICB9XG59XG4iLCI8ZGl2ICNnYWxsZXJ5Q29udGFpbmVyIGNsYXNzPVwiZ2FsbGVyeUNvbnRhaW5lclwiPlxuICA8ZGl2IGNsYXNzPVwiaW5uZXJHYWxsZXJ5Q29udGFpbmVyXCI+XG4gICAgPGRpdlxuICAgICAgKm5nRm9yPVwibGV0IGltZ3JvdyBvZiBnYWxsZXJ5IHwgc2xpY2U6IHJvd0luZGV4OnJvd0luZGV4ICsgcm93c1BlclBhZ2U7IGxldCBpID0gaW5kZXhcIlxuICAgICAgY2xhc3M9XCJpbWFnZXJvd1wiXG4gICAgICBbc3R5bGUubWFyZ2luLWJvdHRvbS5weF09XCJjYWxjSW1hZ2VNYXJnaW4oKVwiPlxuICAgICAgPGltZ1xuICAgICAgICAjaW1hZ2VFbGVtZW50XG4gICAgICAgICpuZ0Zvcj1cImxldCBpbWcgb2YgaW1ncm93OyBsZXQgaiA9IGluZGV4XCJcbiAgICAgICAgY2xhc3M9XCJ0aHVtYm5haWxcIlxuICAgICAgICBbc3R5bGUud2lkdGgucHhdPVwiaW1nWyd3aWR0aCddXCJcbiAgICAgICAgW3N0eWxlLmhlaWdodC5weF09XCJpbWdbJ2hlaWdodCddXCJcbiAgICAgICAgKGNsaWNrKT1cIm9wZW5JbWFnZVZpZXdlcihpbWcpXCJcbiAgICAgICAgW3NyY109XCJpbWdbJ3NyY0FmdGVyRm9jdXMnXVwiXG4gICAgICAgIFtzdHlsZS5iYWNrZ3JvdW5kXT1cImltZy5kb21pbmFudENvbG9yXCJcbiAgICAgICAgW3N0eWxlLm1hcmdpbi1yaWdodC5weF09XCJjYWxjSW1hZ2VNYXJnaW4oKVwiIC8+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuXG4gIDxkaXYgY2xhc3M9XCJwYWdlckNvbnRhaW5lclwiICpuZ0lmPVwiIXJpZ2h0QXJyb3dJbmFjdGl2ZSB8fCAhbGVmdEFycm93SW5hY3RpdmVcIj5cbiAgICA8aW1nXG4gICAgICBbbmdDbGFzc109XCJ7IGluYWN0aXZlOiBsZWZ0QXJyb3dJbmFjdGl2ZSB9XCJcbiAgICAgIGNsYXNzPVwicGFnZXIgbGVmdFwiXG4gICAgICBzcmM9XCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQS9Qanh6ZG1jZ2FXUTlJa3hoZVdWeVh6RWlJSE4wZVd4bFBTSmxibUZpYkdVdFltRmphMmR5YjNWdVpEcHVaWGNnTUNBd0lEUTRJRFE0T3lJZ2RtVnljMmx2YmowaU1TNHhJaUIyYVdWM1FtOTRQU0l3SURBZ05EZ2dORGdpSUhodGJEcHpjR0ZqWlQwaWNISmxjMlZ5ZG1VaUlIaHRiRzV6UFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXdMM04yWnlJZ2VHMXNibk02ZUd4cGJtczlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MekU1T1RrdmVHeHBibXNpUGp4blBqeHdZWFJvSUdROUlrMHlOQ3cwTmtNeE1TNDVMRFEyTERJc016WXVNU3d5TERJMFV6RXhMamtzTWl3eU5Dd3ljekl5TERrdU9Td3lNaXd5TWxNek5pNHhMRFEyTERJMExEUTJlaUJOTWpRc05FTXhNeXcwTERRc01UTXNOQ3d5TkdNd0xERXhMRGtzTWpBc01qQXNNakFnSUNCak1URXNNQ3d5TUMwNUxESXdMVEl3UXpRMExERXpMRE0xTERRc01qUXNOSG9pTHo0OEwyYytQR2MrUEhCdmJIbG5iMjRnY0c5cGJuUnpQU0l5Tnk0MkxETTJMamNnTVRRdU9Td3lOQ0F5Tnk0MkxERXhMak1nTWprdU1Td3hNaTQzSURFM0xqZ3NNalFnTWprdU1Td3pOUzR6SUNBaUx6NDhMMmMrUEM5emRtYytcIlxuICAgICAgKGNsaWNrKT1cIm5hdmlnYXRlKC0xKVwiIC8+XG4gICAgPGltZ1xuICAgICAgW25nQ2xhc3NdPVwieyBpbmFjdGl2ZTogcmlnaHRBcnJvd0luYWN0aXZlIH1cIlxuICAgICAgY2xhc3M9XCJwYWdlciByaWdodFwiXG4gICAgICBzcmM9XCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBEOTRiV3dnZG1WeWMybHZiajBpTVM0d0lpQS9Qanh6ZG1jZ2FXUTlJa3hoZVdWeVh6RWlJSE4wZVd4bFBTSmxibUZpYkdVdFltRmphMmR5YjNWdVpEcHVaWGNnTUNBd0lEUTRJRFE0T3lJZ2RtVnljMmx2YmowaU1TNHhJaUIyYVdWM1FtOTRQU0l3SURBZ05EZ2dORGdpSUhodGJEcHpjR0ZqWlQwaWNISmxjMlZ5ZG1VaUlIaHRiRzV6UFNKb2RIUndPaTh2ZDNkM0xuY3pMbTl5Wnk4eU1EQXdMM04yWnlJZ2VHMXNibk02ZUd4cGJtczlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MekU1T1RrdmVHeHBibXNpUGp4blBqeHdZWFJvSUdROUlrMHlOQ3cwTmtNeE1TNDVMRFEyTERJc016WXVNU3d5TERJMFV6RXhMamtzTWl3eU5Dd3ljekl5TERrdU9Td3lNaXd5TWxNek5pNHhMRFEyTERJMExEUTJlaUJOTWpRc05FTXhNeXcwTERRc01UTXNOQ3d5TkhNNUxESXdMREl3TERJd2N6SXdMVGtzTWpBdE1qQWdJQ0JUTXpVc05Dd3lOQ3cwZWlJdlBqd3ZaejQ4Wno0OGNHOXNlV2R2YmlCd2IybHVkSE05SWpJeExqUXNNell1TnlBeE9TNDVMRE0xTGpNZ016RXVNaXd5TkNBeE9TNDVMREV5TGpjZ01qRXVOQ3d4TVM0eklETTBMakVzTWpRZ0lDSXZQand2Wno0OEwzTjJaejQ9XCJcbiAgICAgIChjbGljayk9XCJuYXZpZ2F0ZSgxKVwiIC8+XG4gIDwvZGl2PlxuPC9kaXY+XG5cbjx2aWV3ZXIgKm5nSWY9XCJpbmNsdWRlVmlld2VyXCI+PC92aWV3ZXI+XG4iXX0=