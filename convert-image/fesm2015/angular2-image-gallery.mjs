import * as i0 from '@angular/core';
import { Injectable, Component, EventEmitter, Input, Output, ViewChild, ViewChildren, HostListener, NgModule } from '@angular/core';
import { Subject } from 'rxjs';
import * as i2$1 from '@angular/common/http';
import * as i3 from '@angular/common';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as i2 from '@angular/platform-browser';
import 'hammerjs';

class ImageService {
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

class ViewerComponent {
    constructor(imageService, sanitizer) {
        this.imageService = imageService;
        this.sanitizer = sanitizer;
        this.images = [];
        this.currentIdx = 0;
        this.leftArrowVisible = true;
        this.rightArrowVisible = true;
        this.categorySelected = 'preview_xxs';
        this.qualitySelectorShown = false;
        this.qualitySelected = 'auto';
        imageService.imagesUpdated$.subscribe((images) => {
            this.images = images;
        });
        imageService.imageSelectedIndexUpdated$.subscribe((newIndex) => {
            this.currentIdx = newIndex;
            this.images.forEach((image) => (image['active'] = false));
            this.images[this.currentIdx]['active'] = true;
            this.transform = 0;
            this.updateQuality();
        });
        imageService.showImageViewerChanged$.subscribe((showViewer) => {
            this.showViewer = showViewer;
        });
        this.math = Math;
    }
    get leftArrowActive() {
        return this.currentIdx > 0;
    }
    get rightArrowActive() {
        return this.currentIdx < this.images.length - 1;
    }
    pan(swipe) {
        this.transform = swipe.deltaX;
    }
    onResize() {
        this.images.forEach((image) => {
            image['viewerImageLoaded'] = false;
            image['active'] = false;
        });
        this.updateImage();
    }
    showQualitySelector() {
        this.qualitySelectorShown = !this.qualitySelectorShown;
    }
    qualityChanged(newQuality) {
        this.qualitySelected = newQuality;
        this.updateImage();
    }
    imageLoaded(image) {
        image['viewerImageLoaded'] = true;
    }
    /**
     * direction (-1: left, 1: right)
     * swipe (user swiped)
     */
    navigate(direction, swipe) {
        if ((direction === 1 && this.currentIdx < this.images.length - 1) || (direction === -1 && this.currentIdx > 0)) {
            if (direction == -1) {
                this.images[this.currentIdx]['transition'] = 'leaveToRight';
                this.images[this.currentIdx - 1]['transition'] = 'enterFromLeft';
            }
            else {
                this.images[this.currentIdx]['transition'] = 'leaveToLeft';
                this.images[this.currentIdx + 1]['transition'] = 'enterFromRight';
            }
            this.currentIdx += direction;
            if (swipe) {
                this.hideNavigationArrows();
            }
            else {
                this.showNavigationArrows();
            }
            this.updateImage();
        }
    }
    showNavigationArrows() {
        this.leftArrowVisible = true;
        this.rightArrowVisible = true;
    }
    closeViewer() {
        this.images.forEach((image) => (image['transition'] = undefined));
        this.images.forEach((image) => (image['active'] = false));
        this.imageService.showImageViewer(false);
    }
    onKeydown(event) {
        const prevent = [37, 39, 27, 36, 35].find((no) => no === event.keyCode);
        if (prevent) {
            event.preventDefault();
        }
        switch (prevent) {
            case 37:
                // navigate left
                this.navigate(-1, false);
                break;
            case 39:
                // navigate right
                this.navigate(1, false);
                break;
            case 27:
                // esc
                this.closeViewer();
                break;
            case 36:
                // pos 1
                this.images[this.currentIdx]['transition'] = 'leaveToRight';
                this.currentIdx = 0;
                this.images[this.currentIdx]['transition'] = 'enterFromLeft';
                this.updateImage();
                break;
            case 35:
                // end
                this.images[this.currentIdx]['transition'] = 'leaveToLeft';
                this.currentIdx = this.images.length - 1;
                this.images[this.currentIdx]['transition'] = 'enterFromRight';
                this.updateImage();
                break;
            default:
                break;
        }
    }
    sanitizedImageUrl(img, index) {
        return this.sanitizer.bypassSecurityTrustStyle(this.rawImageUrl(img, index));
    }
    rawImageUrl(img, index) {
        if (img['viewerImageLoaded']) {
            return `url('${img.resolutions[this.categorySelected].path}')`;
        }
        else if (Math.abs(this.currentIdx - index) <= 1) {
            return `url('${img.resolutions['preview_xxs'].path}')`;
        }
        return '';
    }
    hideNavigationArrows() {
        this.leftArrowVisible = false;
        this.rightArrowVisible = false;
    }
    updateImage() {
        // wait for animation to end
        setTimeout(() => {
            this.updateQuality();
            this.images[this.currentIdx]['active'] = true;
            this.images.forEach((image) => {
                if (image != this.images[this.currentIdx]) {
                    image['active'] = false;
                    this.transform = 0;
                }
            });
        }, 500);
    }
    updateQuality() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        switch (this.qualitySelected) {
            case 'auto': {
                this.categorySelected = 'preview_xxs';
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_xxs'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_xxs'].height) {
                    this.categorySelected = 'preview_xs';
                }
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_xs'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_xs'].height) {
                    this.categorySelected = 'preview_s';
                }
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_s'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_s'].height) {
                    this.categorySelected = 'preview_m';
                }
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_m'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_m'].height) {
                    this.categorySelected = 'preview_l';
                }
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_l'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_l'].height) {
                    this.categorySelected = 'preview_xl';
                }
                if (screenWidth > this.images[this.currentIdx].resolutions['preview_xl'].width &&
                    screenHeight > this.images[this.currentIdx].resolutions['preview_xl'].height) {
                    this.categorySelected = 'raw';
                }
                break;
            }
            case 'low': {
                this.categorySelected = 'preview_xxs';
                break;
            }
            case 'mid': {
                this.categorySelected = 'preview_m';
                break;
            }
            case 'high': {
                this.categorySelected = 'raw';
                break;
            }
            default: {
                this.categorySelected = 'preview_m';
            }
        }
    }
}
ViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ViewerComponent, deps: [{ token: ImageService }, { token: i2.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component });
ViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.1.1", type: ViewerComponent, selector: "viewer", host: { listeners: { "document:keydown": "onKeydown($event)" } }, ngImport: i0, template: "<div\n  class=\"outerContainer\"\n  (window:resize)=\"onResize()\"\n  *ngIf=\"showViewer\"\n  [@showViewerTransition]=\"showViewer\">\n  <img\n    [ngClass]=\"{ activeArrow: leftArrowActive }\"\n    class=\"arrow left\"\n    src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjx0aXRsZS8+PGRlc2MvPiAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaWQ9Im1pdSIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjAuMiI+ICAgICA8ZyBpZD0iQXJ0Ym9hcmQtMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM5NS4wMDAwMDAsIC0xOTEuMDAwMDAwKSI+PGcgaWQ9InNsaWNlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTUuMDAwMDAwLCAxMTkuMDAwMDAwKSIvPjxwYXRoICAgICAgIGQ9Ik0zOTYsMjAyLjUgQzM5NiwxOTYuMTQ4NzI1IDQwMS4xNDg3MjUsMTkxIDQwNy41LDE5MSBDNDEzLjg1MTI3NSwxOTEgNDE5LDE5Ni4xNDg3MjUgNDE5LDIwMi41IEM0MTksMjA4Ljg1MTI3NSA0MTMuODUxMjc1LDIxNCA0MDcuNSwyMTQgQzQwMS4xNDg3MjUsMjE0IDM5NiwyMDguODUxMjc1IDM5NiwyMDIuNSBaIE00MDguNjU2ODU0LDE5Ni44NDMxNDYgTDQxMC4wNzEwNjgsMTk4LjI1NzM1OSBMNDA1LjgyODQyNywyMDIuNSBMNDEwLjA3MTA2OCwyMDYuNzQyNjQxIEw0MDguNjU2ODU0LDIwOC4xNTY4NTQgTDQwMywyMDIuNSBMNDA4LjY1Njg1NCwxOTYuODQzMTQ2IFoiICAgICAgIGZpbGw9IiNhYWEiICAgICAgIGlkPSJjaXJjbGUtYmFjay1hcnJvdy1nbHlwaCIvPjwvZz4gICA8L2c+IDwvc3ZnPg==\"\n    [hidden]=\"!leftArrowVisible\"\n    (click)=\"navigate(-1, false)\" />\n  <img\n    [ngClass]=\"{ activeArrow: rightArrowActive }\"\n    class=\"arrow right\"\n    src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjx0aXRsZS8+PGRlc2MvPjxkZWZzLz4gICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGlkPSJtaXUiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIwLjIiPiAgICAgPGcgaWQ9IkFydGJvYXJkLTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00NjcuMDAwMDAwLCAtMTkxLjAwMDAwMCkiPjxnIGlkPSJzbGljZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE1LjAwMDAwMCwgMTE5LjAwMDAwMCkiLz48cGF0aCAgICAgICBkPSJNNDY4LDIwMi41IEM0NjgsMTk2LjE0ODcyNSA0NzMuMTQ4NzI1LDE5MSA0NzkuNSwxOTEgQzQ4NS44NTEyNzUsMTkxIDQ5MSwxOTYuMTQ4NzI1IDQ5MSwyMDIuNSBDNDkxLDIwOC44NTEyNzUgNDg1Ljg1MTI3NSwyMTQgNDc5LjUsMjE0IEM0NzMuMTQ4NzI1LDIxNCA0NjgsMjA4Ljg1MTI3NSA0NjgsMjAyLjUgWiBNNDgwLjY1Njg1NCwxOTYuODQzMTQ2IEw0ODIuMDcxMDY4LDE5OC4yNTczNTkgTDQ3Ny44Mjg0MjcsMjAyLjUgTDQ4Mi4wNzEwNjgsMjA2Ljc0MjY0MSBMNDgwLjY1Njg1NCwyMDguMTU2ODU0IEw0NzUsMjAyLjUgTDQ4MC42NTY4NTQsMTk2Ljg0MzE0NiBaIiAgICAgICBmaWxsPSIjYWFhIiAgICAgICBpZD0iY2lyY2xlLW5leHQtYXJyb3ctZGlzY2xvc3VyZS1nbHlwaCIgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDc5LjUwMDAwMCwgMjAyLjUwMDAwMCkgc2NhbGUoLTEsIDEpIHRyYW5zbGF0ZSgtNDc5LjUwMDAwMCwgLTIwMi41MDAwMDApICIvPjwvZz4gICA8L2c+IDwvc3ZnPg==\"\n    [hidden]=\"!rightArrowVisible\"\n    (click)=\"navigate(1, false)\" />\n\n  <div class=\"buttonContainer\">\n    <img\n      class=\"action close\"\n      src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwcHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiBmaWxsPSIjYWFhIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPiAgPHBhdGggICAgc3Ryb2tlLXdpZHRoPSIzMCIgc3Ryb2tlPSIjNDQ0IiAgICBkPSJNNDM3LjUsMzg2LjZMMzA2LjksMjU2bDEzMC42LTEzMC42YzE0LjEtMTQuMSwxNC4xLTM2LjgsMC01MC45Yy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMEwyNTYsMjA1LjFMMTI1LjQsNzQuNSAgYy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMGMtMTQuMSwxNC4xLTE0LjEsMzYuOCwwLDUwLjlMMjA1LjEsMjU2TDc0LjUsMzg2LjZjLTE0LjEsMTQuMS0xNC4xLDM2LjgsMCw1MC45ICBjMTQuMSwxNC4xLDM2LjgsMTQuMSw1MC45LDBMMjU2LDMwNi45bDEzMC42LDEzMC42YzE0LjEsMTQuMSwzNi44LDE0LjEsNTAuOSwwQzQ1MS41LDQyMy40LDQ1MS41LDQwMC42LDQzNy41LDM4Ni42eiIvPjwvc3ZnPg==\"\n      (click)=\"closeViewer()\" />\n  </div>\n\n  <div\n    class=\"imageContainer\"\n    (click)=\"showNavigationArrows()\"\n    (swipeleft)=\"navigate(1, $event)\"\n    (swiperight)=\"navigate(-1, $event)\"\n    (pan)=\"pan($event)\">\n    <div\n      *ngFor=\"let img of images; let j = index\"\n      class=\"image\"\n      [class.active]=\"img['active']\"\n      [style.background-image]=\"sanitizedImageUrl(img, j)\"\n      [style.left]=\"transform + 'px'\"\n      [@imageTransition]=\"img['transition']\"></div>\n\n    <img\n      *ngFor=\"let img of images; let j = index\"\n      class=\"preloading-image\"\n      (load)=\"imageLoaded(img)\"\n      src=\"{{ math.abs(currentIdx - j) <= 1 ? img['resolutions'][categorySelected]['path'] : '' }}\" />\n  </div>\n</div>\n", styles: [".outerContainer{inset:0;height:100%;width:100%;position:fixed;background-color:#000000f2;font-family:sans-serif;z-index:1031}.imageContainer{position:absolute;float:none;inset:0}.imageContainer .image,.imageContainer .preloading-image{visibility:hidden}.imageContainer .image.active{position:absolute;visibility:visible;background-repeat:no-repeat;background-size:contain;background-position:center;margin:auto;inset:0;height:100%;width:100%;opacity:1}.arrow{opacity:0}.arrow:hover{cursor:pointer}.outerContainer:hover .arrow.activeArrow{height:calc(20px + 1.5vw);position:absolute;top:calc(50% - ((20px + 1.5vw)/2));bottom:50%;z-index:1;opacity:1;transition:all ease-out .5s}.arrow.left{left:2vw}.arrow.right{right:2vw}.arrow:not(.activeArrow):hover{opacity:0;cursor:pointer;transition:all ease-out .5s}.buttonContainer{position:absolute;top:20px;right:20px;height:20px;text-align:center;opacity:1;z-index:200;transition:all ease-out .5s}.buttonContainer .action{height:100%;cursor:pointer;vertical-align:top}.buttonContainer .action:focus{outline:0}.buttonContainer .action:hover{background-color:#222;transition:all ease-out .3s}.buttonContainer .action.close{width:26px;height:26px}md-button-toggle.checked{background-color:#a0a0a0}.menuButton{position:absolute;bottom:20px;right:20px;text-align:center;opacity:1;z-index:200;transition:all ease-out .5s}@font-face{font-family:Material Icons;font-style:normal;font-weight:400;src:local(\"Material Icons\"),local(\"MaterialIcons-Regular\"),url(https://fonts.gstatic.com/s/materialicons/v19/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format(\"woff2\")}.material-icons{font-family:Material Icons;font-weight:400;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:\"liga\";-webkit-font-smoothing:antialiased}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], animations: [
        trigger('imageTransition', [
            state('enterFromRight', style({
                opacity: 1,
                transform: 'translate(0px, 0px)',
            })),
            state('enterFromLeft', style({
                opacity: 1,
                transform: 'translate(0px, 0px)',
            })),
            state('leaveToLeft', style({
                opacity: 0,
                transform: 'translate(-100px, 0px)',
            })),
            state('leaveToRight', style({
                opacity: 0,
                transform: 'translate(100px, 0px)',
            })),
            transition('* => enterFromRight', [
                style({
                    opacity: 0,
                    transform: 'translate(30px, 0px)',
                }),
                animate('250ms 500ms ease-in'),
            ]),
            transition('* => enterFromLeft', [
                style({
                    opacity: 0,
                    transform: 'translate(-30px, 0px)',
                }),
                animate('250ms 500ms ease-in'),
            ]),
            transition('* => leaveToLeft', [
                style({
                    opacity: 1,
                }),
                animate('250ms ease-out'),
            ]),
            transition('* => leaveToRight', [
                style({
                    opacity: 1,
                }),
                animate('250ms ease-out'),
            ]),
        ]),
        trigger('showViewerTransition', [
            state('true', style({
                opacity: 1,
            })),
            state('void', style({
                opacity: 0,
            })),
            transition('void => *', [
                style({
                    opacity: 0,
                }),
                animate('1000ms ease-in'),
            ]),
            transition('* => void', [
                style({
                    opacity: 1,
                }),
                animate('500ms ease-out'),
            ]),
        ]),
    ] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'viewer', host: {
                        '(document:keydown)': 'onKeydown($event)',
                    }, animations: [
                        trigger('imageTransition', [
                            state('enterFromRight', style({
                                opacity: 1,
                                transform: 'translate(0px, 0px)',
                            })),
                            state('enterFromLeft', style({
                                opacity: 1,
                                transform: 'translate(0px, 0px)',
                            })),
                            state('leaveToLeft', style({
                                opacity: 0,
                                transform: 'translate(-100px, 0px)',
                            })),
                            state('leaveToRight', style({
                                opacity: 0,
                                transform: 'translate(100px, 0px)',
                            })),
                            transition('* => enterFromRight', [
                                style({
                                    opacity: 0,
                                    transform: 'translate(30px, 0px)',
                                }),
                                animate('250ms 500ms ease-in'),
                            ]),
                            transition('* => enterFromLeft', [
                                style({
                                    opacity: 0,
                                    transform: 'translate(-30px, 0px)',
                                }),
                                animate('250ms 500ms ease-in'),
                            ]),
                            transition('* => leaveToLeft', [
                                style({
                                    opacity: 1,
                                }),
                                animate('250ms ease-out'),
                            ]),
                            transition('* => leaveToRight', [
                                style({
                                    opacity: 1,
                                }),
                                animate('250ms ease-out'),
                            ]),
                        ]),
                        trigger('showViewerTransition', [
                            state('true', style({
                                opacity: 1,
                            })),
                            state('void', style({
                                opacity: 0,
                            })),
                            transition('void => *', [
                                style({
                                    opacity: 0,
                                }),
                                animate('1000ms ease-in'),
                            ]),
                            transition('* => void', [
                                style({
                                    opacity: 1,
                                }),
                                animate('500ms ease-out'),
                            ]),
                        ]),
                    ], template: "<div\n  class=\"outerContainer\"\n  (window:resize)=\"onResize()\"\n  *ngIf=\"showViewer\"\n  [@showViewerTransition]=\"showViewer\">\n  <img\n    [ngClass]=\"{ activeArrow: leftArrowActive }\"\n    class=\"arrow left\"\n    src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjx0aXRsZS8+PGRlc2MvPiAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaWQ9Im1pdSIgc3Ryb2tlPSIjNTU1IiBzdHJva2Utd2lkdGg9IjAuMiI+ICAgICA8ZyBpZD0iQXJ0Ym9hcmQtMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTM5NS4wMDAwMDAsIC0xOTEuMDAwMDAwKSI+PGcgaWQ9InNsaWNlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMTUuMDAwMDAwLCAxMTkuMDAwMDAwKSIvPjxwYXRoICAgICAgIGQ9Ik0zOTYsMjAyLjUgQzM5NiwxOTYuMTQ4NzI1IDQwMS4xNDg3MjUsMTkxIDQwNy41LDE5MSBDNDEzLjg1MTI3NSwxOTEgNDE5LDE5Ni4xNDg3MjUgNDE5LDIwMi41IEM0MTksMjA4Ljg1MTI3NSA0MTMuODUxMjc1LDIxNCA0MDcuNSwyMTQgQzQwMS4xNDg3MjUsMjE0IDM5NiwyMDguODUxMjc1IDM5NiwyMDIuNSBaIE00MDguNjU2ODU0LDE5Ni44NDMxNDYgTDQxMC4wNzEwNjgsMTk4LjI1NzM1OSBMNDA1LjgyODQyNywyMDIuNSBMNDEwLjA3MTA2OCwyMDYuNzQyNjQxIEw0MDguNjU2ODU0LDIwOC4xNTY4NTQgTDQwMywyMDIuNSBMNDA4LjY1Njg1NCwxOTYuODQzMTQ2IFoiICAgICAgIGZpbGw9IiNhYWEiICAgICAgIGlkPSJjaXJjbGUtYmFjay1hcnJvdy1nbHlwaCIvPjwvZz4gICA8L2c+IDwvc3ZnPg==\"\n    [hidden]=\"!leftArrowVisible\"\n    (click)=\"navigate(-1, false)\" />\n  <img\n    [ngClass]=\"{ activeArrow: rightArrowActive }\"\n    class=\"arrow right\"\n    src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0cHgiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpza2V0Y2g9Imh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaC9ucyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjx0aXRsZS8+PGRlc2MvPjxkZWZzLz4gICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGlkPSJtaXUiIHN0cm9rZT0iIzU1NSIgc3Ryb2tlLXdpZHRoPSIwLjIiPiAgICAgPGcgaWQ9IkFydGJvYXJkLTEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00NjcuMDAwMDAwLCAtMTkxLjAwMDAwMCkiPjxnIGlkPSJzbGljZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjE1LjAwMDAwMCwgMTE5LjAwMDAwMCkiLz48cGF0aCAgICAgICBkPSJNNDY4LDIwMi41IEM0NjgsMTk2LjE0ODcyNSA0NzMuMTQ4NzI1LDE5MSA0NzkuNSwxOTEgQzQ4NS44NTEyNzUsMTkxIDQ5MSwxOTYuMTQ4NzI1IDQ5MSwyMDIuNSBDNDkxLDIwOC44NTEyNzUgNDg1Ljg1MTI3NSwyMTQgNDc5LjUsMjE0IEM0NzMuMTQ4NzI1LDIxNCA0NjgsMjA4Ljg1MTI3NSA0NjgsMjAyLjUgWiBNNDgwLjY1Njg1NCwxOTYuODQzMTQ2IEw0ODIuMDcxMDY4LDE5OC4yNTczNTkgTDQ3Ny44Mjg0MjcsMjAyLjUgTDQ4Mi4wNzEwNjgsMjA2Ljc0MjY0MSBMNDgwLjY1Njg1NCwyMDguMTU2ODU0IEw0NzUsMjAyLjUgTDQ4MC42NTY4NTQsMTk2Ljg0MzE0NiBaIiAgICAgICBmaWxsPSIjYWFhIiAgICAgICBpZD0iY2lyY2xlLW5leHQtYXJyb3ctZGlzY2xvc3VyZS1nbHlwaCIgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDc5LjUwMDAwMCwgMjAyLjUwMDAwMCkgc2NhbGUoLTEsIDEpIHRyYW5zbGF0ZSgtNDc5LjUwMDAwMCwgLTIwMi41MDAwMDApICIvPjwvZz4gICA8L2c+IDwvc3ZnPg==\"\n    [hidden]=\"!rightArrowVisible\"\n    (click)=\"navigate(1, false)\" />\n\n  <div class=\"buttonContainer\">\n    <img\n      class=\"action close\"\n      src=\"data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjMwcHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiBmaWxsPSIjYWFhIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjI0cHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPiAgPHBhdGggICAgc3Ryb2tlLXdpZHRoPSIzMCIgc3Ryb2tlPSIjNDQ0IiAgICBkPSJNNDM3LjUsMzg2LjZMMzA2LjksMjU2bDEzMC42LTEzMC42YzE0LjEtMTQuMSwxNC4xLTM2LjgsMC01MC45Yy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMEwyNTYsMjA1LjFMMTI1LjQsNzQuNSAgYy0xNC4xLTE0LjEtMzYuOC0xNC4xLTUwLjksMGMtMTQuMSwxNC4xLTE0LjEsMzYuOCwwLDUwLjlMMjA1LjEsMjU2TDc0LjUsMzg2LjZjLTE0LjEsMTQuMS0xNC4xLDM2LjgsMCw1MC45ICBjMTQuMSwxNC4xLDM2LjgsMTQuMSw1MC45LDBMMjU2LDMwNi45bDEzMC42LDEzMC42YzE0LjEsMTQuMSwzNi44LDE0LjEsNTAuOSwwQzQ1MS41LDQyMy40LDQ1MS41LDQwMC42LDQzNy41LDM4Ni42eiIvPjwvc3ZnPg==\"\n      (click)=\"closeViewer()\" />\n  </div>\n\n  <div\n    class=\"imageContainer\"\n    (click)=\"showNavigationArrows()\"\n    (swipeleft)=\"navigate(1, $event)\"\n    (swiperight)=\"navigate(-1, $event)\"\n    (pan)=\"pan($event)\">\n    <div\n      *ngFor=\"let img of images; let j = index\"\n      class=\"image\"\n      [class.active]=\"img['active']\"\n      [style.background-image]=\"sanitizedImageUrl(img, j)\"\n      [style.left]=\"transform + 'px'\"\n      [@imageTransition]=\"img['transition']\"></div>\n\n    <img\n      *ngFor=\"let img of images; let j = index\"\n      class=\"preloading-image\"\n      (load)=\"imageLoaded(img)\"\n      src=\"{{ math.abs(currentIdx - j) <= 1 ? img['resolutions'][categorySelected]['path'] : '' }}\" />\n  </div>\n</div>\n", styles: [".outerContainer{inset:0;height:100%;width:100%;position:fixed;background-color:#000000f2;font-family:sans-serif;z-index:1031}.imageContainer{position:absolute;float:none;inset:0}.imageContainer .image,.imageContainer .preloading-image{visibility:hidden}.imageContainer .image.active{position:absolute;visibility:visible;background-repeat:no-repeat;background-size:contain;background-position:center;margin:auto;inset:0;height:100%;width:100%;opacity:1}.arrow{opacity:0}.arrow:hover{cursor:pointer}.outerContainer:hover .arrow.activeArrow{height:calc(20px + 1.5vw);position:absolute;top:calc(50% - ((20px + 1.5vw)/2));bottom:50%;z-index:1;opacity:1;transition:all ease-out .5s}.arrow.left{left:2vw}.arrow.right{right:2vw}.arrow:not(.activeArrow):hover{opacity:0;cursor:pointer;transition:all ease-out .5s}.buttonContainer{position:absolute;top:20px;right:20px;height:20px;text-align:center;opacity:1;z-index:200;transition:all ease-out .5s}.buttonContainer .action{height:100%;cursor:pointer;vertical-align:top}.buttonContainer .action:focus{outline:0}.buttonContainer .action:hover{background-color:#222;transition:all ease-out .3s}.buttonContainer .action.close{width:26px;height:26px}md-button-toggle.checked{background-color:#a0a0a0}.menuButton{position:absolute;bottom:20px;right:20px;text-align:center;opacity:1;z-index:200;transition:all ease-out .5s}@font-face{font-family:Material Icons;font-style:normal;font-weight:400;src:local(\"Material Icons\"),local(\"MaterialIcons-Regular\"),url(https://fonts.gstatic.com/s/materialicons/v19/2fcrYFNaTjcS6g4U3t-Y5ZjZjT5FdEJ140U2DJYC3mY.woff2) format(\"woff2\")}.material-icons{font-family:Material Icons;font-weight:400;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-feature-settings:\"liga\";-webkit-font-smoothing:antialiased}\n"] }]
        }], ctorParameters: function () { return [{ type: ImageService }, { type: i2.DomSanitizer }]; } });

class GalleryComponent {
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
        var _a;
        // input params changed
        this.imageMetadataUri = this.determineMetadataPath();
        if (!((_a = changes['providedGalleryName']) === null || _a === void 0 ? void 0 : _a.isFirstChange())) {
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
            var _a;
            const imageElements = this.imageElements.toArray();
            if (this.isPaginationActive() || this.isScrolledIntoView((_a = imageElements[index]) === null || _a === void 0 ? void 0 : _a.nativeElement) || !this.lazyLoadGalleryImages) {
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
GalleryComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: GalleryComponent, deps: [{ token: ImageService }, { token: i2$1.HttpClient }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Component });
GalleryComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "15.1.1", type: GalleryComponent, selector: "gallery", inputs: { providedImageMargin: ["flexBorderSize", "providedImageMargin"], providedImageSize: ["flexImageSize", "providedImageSize"], providedGalleryName: ["galleryName", "providedGalleryName"], providedMetadataUri: ["metadataUri", "providedMetadataUri"], rowsPerPage: ["maxRowsPerPage", "rowsPerPage"], includeViewer: "includeViewer", lazyLoadGalleryImages: "lazyLoadGalleryImages" }, outputs: { viewerChange: "viewerChange" }, host: { listeners: { "window:scroll": "triggerCycle($event)", "resize": "windowResize($event)" } }, viewQueries: [{ propertyName: "galleryContainer", first: true, predicate: ["galleryContainer"], descendants: true, static: true }, { propertyName: "imageElements", predicate: ["imageElement"], descendants: true }], usesOnChanges: true, ngImport: i0, template: "<div #galleryContainer class=\"galleryContainer\">\n  <div class=\"innerGalleryContainer\">\n    <div\n      *ngFor=\"let imgrow of gallery | slice: rowIndex:rowIndex + rowsPerPage; let i = index\"\n      class=\"imagerow\"\n      [style.margin-bottom.px]=\"calcImageMargin()\">\n      <img\n        #imageElement\n        *ngFor=\"let img of imgrow; let j = index\"\n        class=\"thumbnail\"\n        [style.width.px]=\"img['width']\"\n        [style.height.px]=\"img['height']\"\n        (click)=\"openImageViewer(img)\"\n        [src]=\"img['srcAfterFocus']\"\n        [style.background]=\"img.dominantColor\"\n        [style.margin-right.px]=\"calcImageMargin()\" />\n    </div>\n  </div>\n\n  <div class=\"pagerContainer\" *ngIf=\"!rightArrowInactive || !leftArrowInactive\">\n    <img\n      [ngClass]=\"{ inactive: leftArrowInactive }\"\n      class=\"pager left\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNGMwLDExLDksMjAsMjAsMjAgICBjMTEsMCwyMC05LDIwLTIwQzQ0LDEzLDM1LDQsMjQsNHoiLz48L2c+PGc+PHBvbHlnb24gcG9pbnRzPSIyNy42LDM2LjcgMTQuOSwyNCAyNy42LDExLjMgMjkuMSwxMi43IDE3LjgsMjQgMjkuMSwzNS4zICAiLz48L2c+PC9zdmc+\"\n      (click)=\"navigate(-1)\" />\n    <img\n      [ngClass]=\"{ inactive: rightArrowInactive }\"\n      class=\"pager right\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNHM5LDIwLDIwLDIwczIwLTksMjAtMjAgICBTMzUsNCwyNCw0eiIvPjwvZz48Zz48cG9seWdvbiBwb2ludHM9IjIxLjQsMzYuNyAxOS45LDM1LjMgMzEuMiwyNCAxOS45LDEyLjcgMjEuNCwxMS4zIDM0LjEsMjQgICIvPjwvZz48L3N2Zz4=\"\n      (click)=\"navigate(1)\" />\n  </div>\n</div>\n\n<viewer *ngIf=\"includeViewer\"></viewer>\n", styles: [".innerGalleryContainer{position:relative}.galleryContainer{height:100%;width:100%;overflow:hidden}.innerGalleryContainer img:last-child{margin-right:-1px!important}.galleryContainer img:hover{filter:brightness(50%);transition:all ease-out .2s;cursor:pointer}.imagerow{margin-right:1px;overflow:hidden;display:flex}::-webkit-scrollbar{display:none}.asyncLoadingContainer{position:absolute;background-color:transparent;height:0px;width:0px;bottom:120px}.pagerContainer{margin:40px auto;width:180px}@media (max-width: 700px){.pagerContainer{margin:40px auto;width:150px}}.pager{display:block;height:60px}@media (max-width: 700px){.pager{display:block;height:45px}}.pager.inactive{opacity:.15;cursor:default}.pager.left{float:left}.pager.right{float:right}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: ViewerComponent, selector: "viewer" }, { kind: "pipe", type: i3.SlicePipe, name: "slice" }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: GalleryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'gallery', template: "<div #galleryContainer class=\"galleryContainer\">\n  <div class=\"innerGalleryContainer\">\n    <div\n      *ngFor=\"let imgrow of gallery | slice: rowIndex:rowIndex + rowsPerPage; let i = index\"\n      class=\"imagerow\"\n      [style.margin-bottom.px]=\"calcImageMargin()\">\n      <img\n        #imageElement\n        *ngFor=\"let img of imgrow; let j = index\"\n        class=\"thumbnail\"\n        [style.width.px]=\"img['width']\"\n        [style.height.px]=\"img['height']\"\n        (click)=\"openImageViewer(img)\"\n        [src]=\"img['srcAfterFocus']\"\n        [style.background]=\"img.dominantColor\"\n        [style.margin-right.px]=\"calcImageMargin()\" />\n    </div>\n  </div>\n\n  <div class=\"pagerContainer\" *ngIf=\"!rightArrowInactive || !leftArrowInactive\">\n    <img\n      [ngClass]=\"{ inactive: leftArrowInactive }\"\n      class=\"pager left\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNGMwLDExLDksMjAsMjAsMjAgICBjMTEsMCwyMC05LDIwLTIwQzQ0LDEzLDM1LDQsMjQsNHoiLz48L2c+PGc+PHBvbHlnb24gcG9pbnRzPSIyNy42LDM2LjcgMTQuOSwyNCAyNy42LDExLjMgMjkuMSwxMi43IDE3LjgsMjQgMjkuMSwzNS4zICAiLz48L2c+PC9zdmc+\"\n      (click)=\"navigate(-1)\" />\n    <img\n      [ngClass]=\"{ inactive: rightArrowInactive }\"\n      class=\"pager right\"\n      src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDQ4IDQ4OyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnPjxwYXRoIGQ9Ik0yNCw0NkMxMS45LDQ2LDIsMzYuMSwyLDI0UzExLjksMiwyNCwyczIyLDkuOSwyMiwyMlMzNi4xLDQ2LDI0LDQ2eiBNMjQsNEMxMyw0LDQsMTMsNCwyNHM5LDIwLDIwLDIwczIwLTksMjAtMjAgICBTMzUsNCwyNCw0eiIvPjwvZz48Zz48cG9seWdvbiBwb2ludHM9IjIxLjQsMzYuNyAxOS45LDM1LjMgMzEuMiwyNCAxOS45LDEyLjcgMjEuNCwxMS4zIDM0LjEsMjQgICIvPjwvZz48L3N2Zz4=\"\n      (click)=\"navigate(1)\" />\n  </div>\n</div>\n\n<viewer *ngIf=\"includeViewer\"></viewer>\n", styles: [".innerGalleryContainer{position:relative}.galleryContainer{height:100%;width:100%;overflow:hidden}.innerGalleryContainer img:last-child{margin-right:-1px!important}.galleryContainer img:hover{filter:brightness(50%);transition:all ease-out .2s;cursor:pointer}.imagerow{margin-right:1px;overflow:hidden;display:flex}::-webkit-scrollbar{display:none}.asyncLoadingContainer{position:absolute;background-color:transparent;height:0px;width:0px;bottom:120px}.pagerContainer{margin:40px auto;width:180px}@media (max-width: 700px){.pagerContainer{margin:40px auto;width:150px}}.pager{display:block;height:60px}@media (max-width: 700px){.pager{display:block;height:45px}}.pager.inactive{opacity:.15;cursor:default}.pager.left{float:left}.pager.right{float:right}\n"] }]
        }], ctorParameters: function () { return [{ type: ImageService }, { type: i2$1.HttpClient }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { providedImageMargin: [{
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

class Angular2ImageGalleryModule {
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

/*
 * Public API Surface of angular2-image-gallery
 */

/**
 * Generated bundle index. Do not edit.
 */

export { Angular2ImageGalleryModule, GalleryComponent, ImageService, ViewerComponent };
//# sourceMappingURL=angular2-image-gallery.mjs.map
