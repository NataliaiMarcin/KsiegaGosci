import { ImageService } from '../services/image.service';
import { Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import * as i0 from "@angular/core";
import * as i1 from "../services/image.service";
import * as i2 from "@angular/platform-browser";
import * as i3 from "@angular/common";
export class ViewerComponent {
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
ViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.1", ngImport: i0, type: ViewerComponent, deps: [{ token: i1.ImageService }, { token: i2.DomSanitizer }], target: i0.ɵɵFactoryTarget.Component });
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
        }], ctorParameters: function () { return [{ type: i1.ImageService }, { type: i2.DomSanitizer }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXIyLWltYWdlLWdhbGxlcnkvc3JjL2xpYi92aWV3ZXIvdmlld2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXIyLWltYWdlLWdhbGxlcnkvc3JjL2xpYi92aWV3ZXIvdmlld2VyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFBO0FBQ3pDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFBOzs7OztBQStGeEQsTUFBTSxPQUFPLGVBQWU7SUFZMUIsWUFBb0IsWUFBMEIsRUFBVSxTQUF1QjtRQUEzRCxpQkFBWSxHQUFaLFlBQVksQ0FBYztRQUFVLGNBQVMsR0FBVCxTQUFTLENBQWM7UUFWL0UsV0FBTSxHQUF5QixFQUFFLENBQUE7UUFDakMsZUFBVSxHQUFXLENBQUMsQ0FBQTtRQUN0QixxQkFBZ0IsR0FBWSxJQUFJLENBQUE7UUFDaEMsc0JBQWlCLEdBQVksSUFBSSxDQUFBO1FBQ2pDLHFCQUFnQixHQUFXLGFBQWEsQ0FBQTtRQUdoQyx5QkFBb0IsR0FBWSxLQUFLLENBQUE7UUFDckMsb0JBQWUsR0FBVyxNQUFNLENBQUE7UUFHdEMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUMvQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUN0QixDQUFDLENBQUMsQ0FBQTtRQUNGLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQTtZQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUE7WUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUE7WUFDbEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ3RCLENBQUMsQ0FBQyxDQUFBO1FBQ0YsWUFBWSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQzVELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO1FBQzlCLENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7SUFDbEIsQ0FBQztJQUVELElBQUksZUFBZTtRQUNqQixPQUFPLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELENBQUM7SUFFRCxHQUFHLENBQUMsS0FBVTtRQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQTtJQUMvQixDQUFDO0lBRUQsUUFBUTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDNUIsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsS0FBSyxDQUFBO1lBQ2xDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDekIsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDcEIsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUE7SUFDeEQsQ0FBQztJQUVELGNBQWMsQ0FBQyxVQUFlO1FBQzVCLElBQUksQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFBO1FBQ2pDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNwQixDQUFDO0lBRUQsV0FBVyxDQUFDLEtBQVU7UUFDcEIsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ25DLENBQUM7SUFFRDs7O09BR0c7SUFDSCxRQUFRLENBQUMsU0FBaUIsRUFBRSxLQUFVO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUM5RyxJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsY0FBYyxDQUFBO2dCQUMzRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsZUFBZSxDQUFBO2FBQ2pFO2lCQUFNO2dCQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLGFBQWEsQ0FBQTtnQkFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLGdCQUFnQixDQUFBO2FBQ2xFO1lBQ0QsSUFBSSxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUE7WUFFNUIsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7YUFDNUI7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUE7YUFDNUI7WUFDRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDbkI7SUFDSCxDQUFDO0lBRUQsb0JBQW9CO1FBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUE7UUFDNUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQTtJQUMvQixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ3pELElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxTQUFTLENBQUMsS0FBb0I7UUFDNUIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3ZFLElBQUksT0FBTyxFQUFFO1lBQ1gsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFBO1NBQ3ZCO1FBRUQsUUFBUSxPQUFPLEVBQUU7WUFDZixLQUFLLEVBQUU7Z0JBQ0wsZ0JBQWdCO2dCQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUN4QixNQUFLO1lBQ1AsS0FBSyxFQUFFO2dCQUNMLGlCQUFpQjtnQkFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7Z0JBQ3ZCLE1BQUs7WUFDUCxLQUFLLEVBQUU7Z0JBQ0wsTUFBTTtnQkFDTixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ2xCLE1BQUs7WUFDUCxLQUFLLEVBQUU7Z0JBQ0wsUUFBUTtnQkFDUixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxjQUFjLENBQUE7Z0JBQzNELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO2dCQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxZQUFZLENBQUMsR0FBRyxlQUFlLENBQUE7Z0JBQzVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtnQkFDbEIsTUFBSztZQUNQLEtBQUssRUFBRTtnQkFDTCxNQUFNO2dCQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLGFBQWEsQ0FBQTtnQkFDMUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7Z0JBQ3hDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLGdCQUFnQixDQUFBO2dCQUM3RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7Z0JBQ2xCLE1BQUs7WUFDUDtnQkFDRSxNQUFLO1NBQ1I7SUFDSCxDQUFDO0lBRUQsaUJBQWlCLENBQUMsR0FBUSxFQUFFLEtBQWE7UUFDdkMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDOUUsQ0FBQztJQUVPLFdBQVcsQ0FBQyxHQUFRLEVBQUUsS0FBYTtRQUN6QyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1lBQzVCLE9BQU8sUUFBUSxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFBO1NBQy9EO2FBQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pELE9BQU8sUUFBUSxHQUFHLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFBO1NBQ3ZEO1FBQ0QsT0FBTyxFQUFFLENBQUE7SUFDWCxDQUFDO0lBRU8sb0JBQW9CO1FBQzFCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQTtJQUNoQyxDQUFDO0lBRU8sV0FBVztRQUNqQiw0QkFBNEI7UUFDNUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNkLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUE7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3pDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUE7b0JBQ3ZCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFBO2lCQUNuQjtZQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztJQUVPLGFBQWE7UUFDbkIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQTtRQUNyQyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFBO1FBRXZDLFFBQVEsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUM1QixLQUFLLE1BQU0sQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxhQUFhLENBQUE7Z0JBRXJDLElBQ0UsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLO29CQUMzRSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFDN0U7b0JBQ0EsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQTtpQkFDckM7Z0JBQ0QsSUFDRSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUs7b0JBQzFFLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxFQUM1RTtvQkFDQSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFBO2lCQUNwQztnQkFDRCxJQUNFLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSztvQkFDekUsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQzNFO29CQUNBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUE7aUJBQ3BDO2dCQUNELElBQ0UsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLO29CQUN6RSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFDM0U7b0JBQ0EsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQTtpQkFDcEM7Z0JBQ0QsSUFDRSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUs7b0JBQ3pFLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxFQUMzRTtvQkFDQSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsWUFBWSxDQUFBO2lCQUNyQztnQkFDRCxJQUNFLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSztvQkFDMUUsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEVBQzVFO29CQUNBLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7aUJBQzlCO2dCQUNELE1BQUs7YUFDTjtZQUNELEtBQUssS0FBSyxDQUFDLENBQUM7Z0JBQ1YsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsQ0FBQTtnQkFDckMsTUFBSzthQUNOO1lBQ0QsS0FBSyxLQUFLLENBQUMsQ0FBQztnQkFDVixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFBO2dCQUNuQyxNQUFLO2FBQ047WUFDRCxLQUFLLE1BQU0sQ0FBQyxDQUFDO2dCQUNYLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUE7Z0JBQzdCLE1BQUs7YUFDTjtZQUNELE9BQU8sQ0FBQyxDQUFDO2dCQUNQLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLENBQUE7YUFDcEM7U0FDRjtJQUNILENBQUM7OzRHQXJPVSxlQUFlO2dHQUFmLGVBQWUsZ0hDbEc1Qixra0pBOENBLDZ0RURqQ2M7UUFDVixPQUFPLENBQUMsaUJBQWlCLEVBQUU7WUFDekIsS0FBSyxDQUNILGdCQUFnQixFQUNoQixLQUFLLENBQUM7Z0JBQ0osT0FBTyxFQUFFLENBQUM7Z0JBQ1YsU0FBUyxFQUFFLHFCQUFxQjthQUNqQyxDQUFDLENBQ0g7WUFDRCxLQUFLLENBQ0gsZUFBZSxFQUNmLEtBQUssQ0FBQztnQkFDSixPQUFPLEVBQUUsQ0FBQztnQkFDVixTQUFTLEVBQUUscUJBQXFCO2FBQ2pDLENBQUMsQ0FDSDtZQUNELEtBQUssQ0FDSCxhQUFhLEVBQ2IsS0FBSyxDQUFDO2dCQUNKLE9BQU8sRUFBRSxDQUFDO2dCQUNWLFNBQVMsRUFBRSx3QkFBd0I7YUFDcEMsQ0FBQyxDQUNIO1lBQ0QsS0FBSyxDQUNILGNBQWMsRUFDZCxLQUFLLENBQUM7Z0JBQ0osT0FBTyxFQUFFLENBQUM7Z0JBQ1YsU0FBUyxFQUFFLHVCQUF1QjthQUNuQyxDQUFDLENBQ0g7WUFDRCxVQUFVLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2hDLEtBQUssQ0FBQztvQkFDSixPQUFPLEVBQUUsQ0FBQztvQkFDVixTQUFTLEVBQUUsc0JBQXNCO2lCQUNsQyxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQzthQUMvQixDQUFDO1lBQ0YsVUFBVSxDQUFDLG9CQUFvQixFQUFFO2dCQUMvQixLQUFLLENBQUM7b0JBQ0osT0FBTyxFQUFFLENBQUM7b0JBQ1YsU0FBUyxFQUFFLHVCQUF1QjtpQkFDbkMsQ0FBQztnQkFDRixPQUFPLENBQUMscUJBQXFCLENBQUM7YUFDL0IsQ0FBQztZQUNGLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDN0IsS0FBSyxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFDO2lCQUNYLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2FBQzFCLENBQUM7WUFDRixVQUFVLENBQUMsbUJBQW1CLEVBQUU7Z0JBQzlCLEtBQUssQ0FBQztvQkFDSixPQUFPLEVBQUUsQ0FBQztpQkFDWCxDQUFDO2dCQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUMxQixDQUFDO1NBQ0gsQ0FBQztRQUNGLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRTtZQUM5QixLQUFLLENBQ0gsTUFBTSxFQUNOLEtBQUssQ0FBQztnQkFDSixPQUFPLEVBQUUsQ0FBQzthQUNYLENBQUMsQ0FDSDtZQUNELEtBQUssQ0FDSCxNQUFNLEVBQ04sS0FBSyxDQUFDO2dCQUNKLE9BQU8sRUFBRSxDQUFDO2FBQ1gsQ0FBQyxDQUNIO1lBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRTtnQkFDdEIsS0FBSyxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFDO2lCQUNYLENBQUM7Z0JBQ0YsT0FBTyxDQUFDLGdCQUFnQixDQUFDO2FBQzFCLENBQUM7WUFDRixVQUFVLENBQUMsV0FBVyxFQUFFO2dCQUN0QixLQUFLLENBQUM7b0JBQ0osT0FBTyxFQUFFLENBQUM7aUJBQ1gsQ0FBQztnQkFDRixPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFDMUIsQ0FBQztTQUNILENBQUM7S0FDSDsyRkFFVSxlQUFlO2tCQTVGM0IsU0FBUzsrQkFDRSxRQUFRLFFBR1o7d0JBQ0osb0JBQW9CLEVBQUUsbUJBQW1CO3FCQUMxQyxjQUNXO3dCQUNWLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTs0QkFDekIsS0FBSyxDQUNILGdCQUFnQixFQUNoQixLQUFLLENBQUM7Z0NBQ0osT0FBTyxFQUFFLENBQUM7Z0NBQ1YsU0FBUyxFQUFFLHFCQUFxQjs2QkFDakMsQ0FBQyxDQUNIOzRCQUNELEtBQUssQ0FDSCxlQUFlLEVBQ2YsS0FBSyxDQUFDO2dDQUNKLE9BQU8sRUFBRSxDQUFDO2dDQUNWLFNBQVMsRUFBRSxxQkFBcUI7NkJBQ2pDLENBQUMsQ0FDSDs0QkFDRCxLQUFLLENBQ0gsYUFBYSxFQUNiLEtBQUssQ0FBQztnQ0FDSixPQUFPLEVBQUUsQ0FBQztnQ0FDVixTQUFTLEVBQUUsd0JBQXdCOzZCQUNwQyxDQUFDLENBQ0g7NEJBQ0QsS0FBSyxDQUNILGNBQWMsRUFDZCxLQUFLLENBQUM7Z0NBQ0osT0FBTyxFQUFFLENBQUM7Z0NBQ1YsU0FBUyxFQUFFLHVCQUF1Qjs2QkFDbkMsQ0FBQyxDQUNIOzRCQUNELFVBQVUsQ0FBQyxxQkFBcUIsRUFBRTtnQ0FDaEMsS0FBSyxDQUFDO29DQUNKLE9BQU8sRUFBRSxDQUFDO29DQUNWLFNBQVMsRUFBRSxzQkFBc0I7aUNBQ2xDLENBQUM7Z0NBQ0YsT0FBTyxDQUFDLHFCQUFxQixDQUFDOzZCQUMvQixDQUFDOzRCQUNGLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRTtnQ0FDL0IsS0FBSyxDQUFDO29DQUNKLE9BQU8sRUFBRSxDQUFDO29DQUNWLFNBQVMsRUFBRSx1QkFBdUI7aUNBQ25DLENBQUM7Z0NBQ0YsT0FBTyxDQUFDLHFCQUFxQixDQUFDOzZCQUMvQixDQUFDOzRCQUNGLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRTtnQ0FDN0IsS0FBSyxDQUFDO29DQUNKLE9BQU8sRUFBRSxDQUFDO2lDQUNYLENBQUM7Z0NBQ0YsT0FBTyxDQUFDLGdCQUFnQixDQUFDOzZCQUMxQixDQUFDOzRCQUNGLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtnQ0FDOUIsS0FBSyxDQUFDO29DQUNKLE9BQU8sRUFBRSxDQUFDO2lDQUNYLENBQUM7Z0NBQ0YsT0FBTyxDQUFDLGdCQUFnQixDQUFDOzZCQUMxQixDQUFDO3lCQUNILENBQUM7d0JBQ0YsT0FBTyxDQUFDLHNCQUFzQixFQUFFOzRCQUM5QixLQUFLLENBQ0gsTUFBTSxFQUNOLEtBQUssQ0FBQztnQ0FDSixPQUFPLEVBQUUsQ0FBQzs2QkFDWCxDQUFDLENBQ0g7NEJBQ0QsS0FBSyxDQUNILE1BQU0sRUFDTixLQUFLLENBQUM7Z0NBQ0osT0FBTyxFQUFFLENBQUM7NkJBQ1gsQ0FBQyxDQUNIOzRCQUNELFVBQVUsQ0FBQyxXQUFXLEVBQUU7Z0NBQ3RCLEtBQUssQ0FBQztvQ0FDSixPQUFPLEVBQUUsQ0FBQztpQ0FDWCxDQUFDO2dDQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs2QkFDMUIsQ0FBQzs0QkFDRixVQUFVLENBQUMsV0FBVyxFQUFFO2dDQUN0QixLQUFLLENBQUM7b0NBQ0osT0FBTyxFQUFFLENBQUM7aUNBQ1gsQ0FBQztnQ0FDRixPQUFPLENBQUMsZ0JBQWdCLENBQUM7NkJBQzFCLENBQUM7eUJBQ0gsQ0FBQztxQkFDSCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEltYWdlU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL2ltYWdlLnNlcnZpY2UnXG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJ1xuaW1wb3J0IHsgYW5pbWF0ZSwgc3RhdGUsIHN0eWxlLCB0cmFuc2l0aW9uLCB0cmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucydcbmltcG9ydCB7IERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInXG5pbXBvcnQgeyBJbWFnZU1ldGFkYXRhIH0gZnJvbSAnLi4vZGF0YS9pbWFnZS1tZXRhZGF0YSdcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAndmlld2VyJyxcbiAgdGVtcGxhdGVVcmw6ICcuL3ZpZXdlci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3ZpZXdlci5jb21wb25lbnQuc2FzcyddLFxuICBob3N0OiB7XG4gICAgJyhkb2N1bWVudDprZXlkb3duKSc6ICdvbktleWRvd24oJGV2ZW50KScsXG4gIH0sXG4gIGFuaW1hdGlvbnM6IFtcbiAgICB0cmlnZ2VyKCdpbWFnZVRyYW5zaXRpb24nLCBbXG4gICAgICBzdGF0ZShcbiAgICAgICAgJ2VudGVyRnJvbVJpZ2h0JyxcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDBweCwgMHB4KScsXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgc3RhdGUoXG4gICAgICAgICdlbnRlckZyb21MZWZ0JyxcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDBweCwgMHB4KScsXG4gICAgICAgIH0pXG4gICAgICApLFxuICAgICAgc3RhdGUoXG4gICAgICAgICdsZWF2ZVRvTGVmdCcsXG4gICAgICAgIHN0eWxlKHtcbiAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgtMTAwcHgsIDBweCknLFxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIHN0YXRlKFxuICAgICAgICAnbGVhdmVUb1JpZ2h0JyxcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKDEwMHB4LCAwcHgpJyxcbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGVudGVyRnJvbVJpZ2h0JywgW1xuICAgICAgICBzdHlsZSh7XG4gICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoMzBweCwgMHB4KScsXG4gICAgICAgIH0pLFxuICAgICAgICBhbmltYXRlKCcyNTBtcyA1MDBtcyBlYXNlLWluJyksXG4gICAgICBdKSxcbiAgICAgIHRyYW5zaXRpb24oJyogPT4gZW50ZXJGcm9tTGVmdCcsIFtcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKC0zMHB4LCAwcHgpJyxcbiAgICAgICAgfSksXG4gICAgICAgIGFuaW1hdGUoJzI1MG1zIDUwMG1zIGVhc2UtaW4nKSxcbiAgICAgIF0pLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiBsZWF2ZVRvTGVmdCcsIFtcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIH0pLFxuICAgICAgICBhbmltYXRlKCcyNTBtcyBlYXNlLW91dCcpLFxuICAgICAgXSksXG4gICAgICB0cmFuc2l0aW9uKCcqID0+IGxlYXZlVG9SaWdodCcsIFtcbiAgICAgICAgc3R5bGUoe1xuICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIH0pLFxuICAgICAgICBhbmltYXRlKCcyNTBtcyBlYXNlLW91dCcpLFxuICAgICAgXSksXG4gICAgXSksXG4gICAgdHJpZ2dlcignc2hvd1ZpZXdlclRyYW5zaXRpb24nLCBbXG4gICAgICBzdGF0ZShcbiAgICAgICAgJ3RydWUnLFxuICAgICAgICBzdHlsZSh7XG4gICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICBzdGF0ZShcbiAgICAgICAgJ3ZvaWQnLFxuICAgICAgICBzdHlsZSh7XG4gICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBbXG4gICAgICAgIHN0eWxlKHtcbiAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICB9KSxcbiAgICAgICAgYW5pbWF0ZSgnMTAwMG1zIGVhc2UtaW4nKSxcbiAgICAgIF0pLFxuICAgICAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgW1xuICAgICAgICBzdHlsZSh7XG4gICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgfSksXG4gICAgICAgIGFuaW1hdGUoJzUwMG1zIGVhc2Utb3V0JyksXG4gICAgICBdKSxcbiAgICBdKSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgVmlld2VyQ29tcG9uZW50IHtcbiAgc2hvd1ZpZXdlcjogYm9vbGVhblxuICBpbWFnZXM6IEFycmF5PEltYWdlTWV0YWRhdGE+ID0gW11cbiAgY3VycmVudElkeDogbnVtYmVyID0gMFxuICBsZWZ0QXJyb3dWaXNpYmxlOiBib29sZWFuID0gdHJ1ZVxuICByaWdodEFycm93VmlzaWJsZTogYm9vbGVhbiA9IHRydWVcbiAgY2F0ZWdvcnlTZWxlY3RlZDogc3RyaW5nID0gJ3ByZXZpZXdfeHhzJ1xuICB0cmFuc2Zvcm06IG51bWJlclxuICBtYXRoOiBNYXRoXG4gIHByaXZhdGUgcXVhbGl0eVNlbGVjdG9yU2hvd246IGJvb2xlYW4gPSBmYWxzZVxuICBwcml2YXRlIHF1YWxpdHlTZWxlY3RlZDogc3RyaW5nID0gJ2F1dG8nXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBpbWFnZVNlcnZpY2U6IEltYWdlU2VydmljZSwgcHJpdmF0ZSBzYW5pdGl6ZXI6IERvbVNhbml0aXplcikge1xuICAgIGltYWdlU2VydmljZS5pbWFnZXNVcGRhdGVkJC5zdWJzY3JpYmUoKGltYWdlcykgPT4ge1xuICAgICAgdGhpcy5pbWFnZXMgPSBpbWFnZXNcbiAgICB9KVxuICAgIGltYWdlU2VydmljZS5pbWFnZVNlbGVjdGVkSW5kZXhVcGRhdGVkJC5zdWJzY3JpYmUoKG5ld0luZGV4KSA9PiB7XG4gICAgICB0aGlzLmN1cnJlbnRJZHggPSBuZXdJbmRleFxuICAgICAgdGhpcy5pbWFnZXMuZm9yRWFjaCgoaW1hZ2UpID0+IChpbWFnZVsnYWN0aXZlJ10gPSBmYWxzZSkpXG4gICAgICB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdWydhY3RpdmUnXSA9IHRydWVcbiAgICAgIHRoaXMudHJhbnNmb3JtID0gMFxuICAgICAgdGhpcy51cGRhdGVRdWFsaXR5KClcbiAgICB9KVxuICAgIGltYWdlU2VydmljZS5zaG93SW1hZ2VWaWV3ZXJDaGFuZ2VkJC5zdWJzY3JpYmUoKHNob3dWaWV3ZXIpID0+IHtcbiAgICAgIHRoaXMuc2hvd1ZpZXdlciA9IHNob3dWaWV3ZXJcbiAgICB9KVxuICAgIHRoaXMubWF0aCA9IE1hdGhcbiAgfVxuXG4gIGdldCBsZWZ0QXJyb3dBY3RpdmUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudElkeCA+IDBcbiAgfVxuXG4gIGdldCByaWdodEFycm93QWN0aXZlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRJZHggPCB0aGlzLmltYWdlcy5sZW5ndGggLSAxXG4gIH1cblxuICBwYW4oc3dpcGU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudHJhbnNmb3JtID0gc3dpcGUuZGVsdGFYXG4gIH1cblxuICBvblJlc2l6ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmltYWdlcy5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgaW1hZ2VbJ3ZpZXdlckltYWdlTG9hZGVkJ10gPSBmYWxzZVxuICAgICAgaW1hZ2VbJ2FjdGl2ZSddID0gZmFsc2VcbiAgICB9KVxuICAgIHRoaXMudXBkYXRlSW1hZ2UoKVxuICB9XG5cbiAgc2hvd1F1YWxpdHlTZWxlY3RvcigpOiB2b2lkIHtcbiAgICB0aGlzLnF1YWxpdHlTZWxlY3RvclNob3duID0gIXRoaXMucXVhbGl0eVNlbGVjdG9yU2hvd25cbiAgfVxuXG4gIHF1YWxpdHlDaGFuZ2VkKG5ld1F1YWxpdHk6IGFueSk6IHZvaWQge1xuICAgIHRoaXMucXVhbGl0eVNlbGVjdGVkID0gbmV3UXVhbGl0eVxuICAgIHRoaXMudXBkYXRlSW1hZ2UoKVxuICB9XG5cbiAgaW1hZ2VMb2FkZWQoaW1hZ2U6IGFueSk6IHZvaWQge1xuICAgIGltYWdlWyd2aWV3ZXJJbWFnZUxvYWRlZCddID0gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIGRpcmVjdGlvbiAoLTE6IGxlZnQsIDE6IHJpZ2h0KVxuICAgKiBzd2lwZSAodXNlciBzd2lwZWQpXG4gICAqL1xuICBuYXZpZ2F0ZShkaXJlY3Rpb246IG51bWJlciwgc3dpcGU6IGFueSk6IHZvaWQge1xuICAgIGlmICgoZGlyZWN0aW9uID09PSAxICYmIHRoaXMuY3VycmVudElkeCA8IHRoaXMuaW1hZ2VzLmxlbmd0aCAtIDEpIHx8IChkaXJlY3Rpb24gPT09IC0xICYmIHRoaXMuY3VycmVudElkeCA+IDApKSB7XG4gICAgICBpZiAoZGlyZWN0aW9uID09IC0xKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF1bJ3RyYW5zaXRpb24nXSA9ICdsZWF2ZVRvUmlnaHQnXG4gICAgICAgIHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeCAtIDFdWyd0cmFuc2l0aW9uJ10gPSAnZW50ZXJGcm9tTGVmdCdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF1bJ3RyYW5zaXRpb24nXSA9ICdsZWF2ZVRvTGVmdCdcbiAgICAgICAgdGhpcy5pbWFnZXNbdGhpcy5jdXJyZW50SWR4ICsgMV1bJ3RyYW5zaXRpb24nXSA9ICdlbnRlckZyb21SaWdodCdcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudElkeCArPSBkaXJlY3Rpb25cblxuICAgICAgaWYgKHN3aXBlKSB7XG4gICAgICAgIHRoaXMuaGlkZU5hdmlnYXRpb25BcnJvd3MoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaG93TmF2aWdhdGlvbkFycm93cygpXG4gICAgICB9XG4gICAgICB0aGlzLnVwZGF0ZUltYWdlKClcbiAgICB9XG4gIH1cblxuICBzaG93TmF2aWdhdGlvbkFycm93cygpOiB2b2lkIHtcbiAgICB0aGlzLmxlZnRBcnJvd1Zpc2libGUgPSB0cnVlXG4gICAgdGhpcy5yaWdodEFycm93VmlzaWJsZSA9IHRydWVcbiAgfVxuXG4gIGNsb3NlVmlld2VyKCk6IHZvaWQge1xuICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goKGltYWdlKSA9PiAoaW1hZ2VbJ3RyYW5zaXRpb24nXSA9IHVuZGVmaW5lZCkpXG4gICAgdGhpcy5pbWFnZXMuZm9yRWFjaCgoaW1hZ2UpID0+IChpbWFnZVsnYWN0aXZlJ10gPSBmYWxzZSkpXG4gICAgdGhpcy5pbWFnZVNlcnZpY2Uuc2hvd0ltYWdlVmlld2VyKGZhbHNlKVxuICB9XG5cbiAgb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcHJldmVudCA9IFszNywgMzksIDI3LCAzNiwgMzVdLmZpbmQoKG5vKSA9PiBubyA9PT0gZXZlbnQua2V5Q29kZSlcbiAgICBpZiAocHJldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIH1cblxuICAgIHN3aXRjaCAocHJldmVudCkge1xuICAgICAgY2FzZSAzNzpcbiAgICAgICAgLy8gbmF2aWdhdGUgbGVmdFxuICAgICAgICB0aGlzLm5hdmlnYXRlKC0xLCBmYWxzZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMzk6XG4gICAgICAgIC8vIG5hdmlnYXRlIHJpZ2h0XG4gICAgICAgIHRoaXMubmF2aWdhdGUoMSwgZmFsc2UpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDI3OlxuICAgICAgICAvLyBlc2NcbiAgICAgICAgdGhpcy5jbG9zZVZpZXdlcigpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIDM2OlxuICAgICAgICAvLyBwb3MgMVxuICAgICAgICB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdWyd0cmFuc2l0aW9uJ10gPSAnbGVhdmVUb1JpZ2h0J1xuICAgICAgICB0aGlzLmN1cnJlbnRJZHggPSAwXG4gICAgICAgIHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF1bJ3RyYW5zaXRpb24nXSA9ICdlbnRlckZyb21MZWZ0J1xuICAgICAgICB0aGlzLnVwZGF0ZUltYWdlKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgMzU6XG4gICAgICAgIC8vIGVuZFxuICAgICAgICB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdWyd0cmFuc2l0aW9uJ10gPSAnbGVhdmVUb0xlZnQnXG4gICAgICAgIHRoaXMuY3VycmVudElkeCA9IHRoaXMuaW1hZ2VzLmxlbmd0aCAtIDFcbiAgICAgICAgdGhpcy5pbWFnZXNbdGhpcy5jdXJyZW50SWR4XVsndHJhbnNpdGlvbiddID0gJ2VudGVyRnJvbVJpZ2h0J1xuICAgICAgICB0aGlzLnVwZGF0ZUltYWdlKClcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgc2FuaXRpemVkSW1hZ2VVcmwoaW1nOiBhbnksIGluZGV4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFN0eWxlKHRoaXMucmF3SW1hZ2VVcmwoaW1nLCBpbmRleCkpXG4gIH1cblxuICBwcml2YXRlIHJhd0ltYWdlVXJsKGltZzogYW55LCBpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKGltZ1sndmlld2VySW1hZ2VMb2FkZWQnXSkge1xuICAgICAgcmV0dXJuIGB1cmwoJyR7aW1nLnJlc29sdXRpb25zW3RoaXMuY2F0ZWdvcnlTZWxlY3RlZF0ucGF0aH0nKWBcbiAgICB9IGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuY3VycmVudElkeCAtIGluZGV4KSA8PSAxKSB7XG4gICAgICByZXR1cm4gYHVybCgnJHtpbWcucmVzb2x1dGlvbnNbJ3ByZXZpZXdfeHhzJ10ucGF0aH0nKWBcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBwcml2YXRlIGhpZGVOYXZpZ2F0aW9uQXJyb3dzKCk6IHZvaWQge1xuICAgIHRoaXMubGVmdEFycm93VmlzaWJsZSA9IGZhbHNlXG4gICAgdGhpcy5yaWdodEFycm93VmlzaWJsZSA9IGZhbHNlXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUltYWdlKCk6IHZvaWQge1xuICAgIC8vIHdhaXQgZm9yIGFuaW1hdGlvbiB0byBlbmRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMudXBkYXRlUXVhbGl0eSgpXG4gICAgICB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdWydhY3RpdmUnXSA9IHRydWVcbiAgICAgIHRoaXMuaW1hZ2VzLmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgIGlmIChpbWFnZSAhPSB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdKSB7XG4gICAgICAgICAgaW1hZ2VbJ2FjdGl2ZSddID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IDBcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LCA1MDApXG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVF1YWxpdHkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2NyZWVuV2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuICAgIGNvbnN0IHNjcmVlbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXG4gICAgc3dpdGNoICh0aGlzLnF1YWxpdHlTZWxlY3RlZCkge1xuICAgICAgY2FzZSAnYXV0byc6IHtcbiAgICAgICAgdGhpcy5jYXRlZ29yeVNlbGVjdGVkID0gJ3ByZXZpZXdfeHhzJ1xuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBzY3JlZW5XaWR0aCA+IHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF0ucmVzb2x1dGlvbnNbJ3ByZXZpZXdfeHhzJ10ud2lkdGggJiZcbiAgICAgICAgICBzY3JlZW5IZWlnaHQgPiB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdLnJlc29sdXRpb25zWydwcmV2aWV3X3h4cyddLmhlaWdodFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmNhdGVnb3J5U2VsZWN0ZWQgPSAncHJldmlld194cydcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgc2NyZWVuV2lkdGggPiB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdLnJlc29sdXRpb25zWydwcmV2aWV3X3hzJ10ud2lkdGggJiZcbiAgICAgICAgICBzY3JlZW5IZWlnaHQgPiB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdLnJlc29sdXRpb25zWydwcmV2aWV3X3hzJ10uaGVpZ2h0XG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuY2F0ZWdvcnlTZWxlY3RlZCA9ICdwcmV2aWV3X3MnXG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHNjcmVlbldpZHRoID4gdGhpcy5pbWFnZXNbdGhpcy5jdXJyZW50SWR4XS5yZXNvbHV0aW9uc1sncHJldmlld19zJ10ud2lkdGggJiZcbiAgICAgICAgICBzY3JlZW5IZWlnaHQgPiB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdLnJlc29sdXRpb25zWydwcmV2aWV3X3MnXS5oZWlnaHRcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5jYXRlZ29yeVNlbGVjdGVkID0gJ3ByZXZpZXdfbSdcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgc2NyZWVuV2lkdGggPiB0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJZHhdLnJlc29sdXRpb25zWydwcmV2aWV3X20nXS53aWR0aCAmJlxuICAgICAgICAgIHNjcmVlbkhlaWdodCA+IHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF0ucmVzb2x1dGlvbnNbJ3ByZXZpZXdfbSddLmhlaWdodFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmNhdGVnb3J5U2VsZWN0ZWQgPSAncHJldmlld19sJ1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICBzY3JlZW5XaWR0aCA+IHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF0ucmVzb2x1dGlvbnNbJ3ByZXZpZXdfbCddLndpZHRoICYmXG4gICAgICAgICAgc2NyZWVuSGVpZ2h0ID4gdGhpcy5pbWFnZXNbdGhpcy5jdXJyZW50SWR4XS5yZXNvbHV0aW9uc1sncHJldmlld19sJ10uaGVpZ2h0XG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMuY2F0ZWdvcnlTZWxlY3RlZCA9ICdwcmV2aWV3X3hsJ1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICBzY3JlZW5XaWR0aCA+IHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF0ucmVzb2x1dGlvbnNbJ3ByZXZpZXdfeGwnXS53aWR0aCAmJlxuICAgICAgICAgIHNjcmVlbkhlaWdodCA+IHRoaXMuaW1hZ2VzW3RoaXMuY3VycmVudElkeF0ucmVzb2x1dGlvbnNbJ3ByZXZpZXdfeGwnXS5oZWlnaHRcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhpcy5jYXRlZ29yeVNlbGVjdGVkID0gJ3JhdydcbiAgICAgICAgfVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgY2FzZSAnbG93Jzoge1xuICAgICAgICB0aGlzLmNhdGVnb3J5U2VsZWN0ZWQgPSAncHJldmlld194eHMnXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlICdtaWQnOiB7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnlTZWxlY3RlZCA9ICdwcmV2aWV3X20nXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlICdoaWdoJzoge1xuICAgICAgICB0aGlzLmNhdGVnb3J5U2VsZWN0ZWQgPSAncmF3J1xuICAgICAgICBicmVha1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aGlzLmNhdGVnb3J5U2VsZWN0ZWQgPSAncHJldmlld19tJ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiPGRpdlxuICBjbGFzcz1cIm91dGVyQ29udGFpbmVyXCJcbiAgKHdpbmRvdzpyZXNpemUpPVwib25SZXNpemUoKVwiXG4gICpuZ0lmPVwic2hvd1ZpZXdlclwiXG4gIFtAc2hvd1ZpZXdlclRyYW5zaXRpb25dPVwic2hvd1ZpZXdlclwiPlxuICA8aW1nXG4gICAgW25nQ2xhc3NdPVwieyBhY3RpdmVBcnJvdzogbGVmdEFycm93QWN0aXZlIH1cIlxuICAgIGNsYXNzPVwiYXJyb3cgbGVmdFwiXG4gICAgc3JjPVwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCb1pXbG5hSFE5SWpJMGNIZ2lJSFpsY25OcGIyNDlJakV1TVNJZ2RtbGxkMEp2ZUQwaU1DQXdJREkwSURJMElpQjNhV1IwYUQwaU1qUndlQ0lnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JaUI0Yld4dWN6cHphMlYwWTJnOUltaDBkSEE2THk5M2QzY3VZbTlvWlcxcFlXNWpiMlJwYm1jdVkyOXRMM05yWlhSamFDOXVjeUlnZUcxc2JuTTZlR3hwYm1zOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6RTVPVGt2ZUd4cGJtc2lQangwYVhSc1pTOCtQR1JsYzJNdlBpQWdJRHhuSUdacGJHdzlJbTV2Ym1VaUlHWnBiR3d0Y25Wc1pUMGlaWFpsYm05a1pDSWdhV1E5SW0xcGRTSWdjM1J5YjJ0bFBTSWpOVFUxSWlCemRISnZhMlV0ZDJsa2RHZzlJakF1TWlJK0lDQWdJQ0E4WnlCcFpEMGlRWEowWW05aGNtUXRNU0lnZEhKaGJuTm1iM0p0UFNKMGNtRnVjMnhoZEdVb0xUTTVOUzR3TURBd01EQXNJQzB4T1RFdU1EQXdNREF3S1NJK1BHY2dhV1E5SW5Oc2FXTmxJaUIwY21GdWMyWnZjbTA5SW5SeVlXNXpiR0YwWlNneU1UVXVNREF3TURBd0xDQXhNVGt1TURBd01EQXdLU0l2UGp4d1lYUm9JQ0FnSUNBZ0lHUTlJazB6T1RZc01qQXlMalVnUXpNNU5pd3hPVFl1TVRRNE56STFJRFF3TVM0eE5EZzNNalVzTVRreElEUXdOeTQxTERFNU1TQkROREV6TGpnMU1USTNOU3d4T1RFZ05ERTVMREU1Tmk0eE5EZzNNalVnTkRFNUxESXdNaTQxSUVNME1Ua3NNakE0TGpnMU1USTNOU0EwTVRNdU9EVXhNamMxTERJeE5DQTBNRGN1TlN3eU1UUWdRelF3TVM0eE5EZzNNalVzTWpFMElETTVOaXd5TURndU9EVXhNamMxSURNNU5pd3lNREl1TlNCYUlFMDBNRGd1TmpVMk9EVTBMREU1Tmk0NE5ETXhORFlnVERReE1DNHdOekV3Tmpnc01UazRMakkxTnpNMU9TQk1OREExTGpneU9EUXlOeXd5TURJdU5TQk1OREV3TGpBM01UQTJPQ3d5TURZdU56UXlOalF4SUV3ME1EZ3VOalUyT0RVMExESXdPQzR4TlRZNE5UUWdURFF3TXl3eU1ESXVOU0JNTkRBNExqWTFOamcxTkN3eE9UWXVPRFF6TVRRMklGb2lJQ0FnSUNBZ0lHWnBiR3c5SWlOaFlXRWlJQ0FnSUNBZ0lHbGtQU0pqYVhKamJHVXRZbUZqYXkxaGNuSnZkeTFuYkhsd2FDSXZQand2Wno0Z0lDQThMMmMrSUR3dmMzWm5QZz09XCJcbiAgICBbaGlkZGVuXT1cIiFsZWZ0QXJyb3dWaXNpYmxlXCJcbiAgICAoY2xpY2spPVwibmF2aWdhdGUoLTEsIGZhbHNlKVwiIC8+XG4gIDxpbWdcbiAgICBbbmdDbGFzc109XCJ7IGFjdGl2ZUFycm93OiByaWdodEFycm93QWN0aXZlIH1cIlxuICAgIGNsYXNzPVwiYXJyb3cgcmlnaHRcIlxuICAgIHNyYz1cImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5Qm9aV2xuYUhROUlqSTBjSGdpSUhabGNuTnBiMjQ5SWpFdU1TSWdkbWxsZDBKdmVEMGlNQ0F3SURJMElESTBJaUIzYVdSMGFEMGlNalJ3ZUNJZ2VHMXNibk05SW1oMGRIQTZMeTkzZDNjdWR6TXViM0puTHpJd01EQXZjM1puSWlCNGJXeHVjenB6YTJWMFkyZzlJbWgwZEhBNkx5OTNkM2N1WW05b1pXMXBZVzVqYjJScGJtY3VZMjl0TDNOclpYUmphQzl1Y3lJZ2VHMXNibk02ZUd4cGJtczlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5MekU1T1RrdmVHeHBibXNpUGp4MGFYUnNaUzgrUEdSbGMyTXZQanhrWldaekx6NGdJQ0E4WnlCbWFXeHNQU0p1YjI1bElpQm1hV3hzTFhKMWJHVTlJbVYyWlc1dlpHUWlJR2xrUFNKdGFYVWlJSE4wY205clpUMGlJelUxTlNJZ2MzUnliMnRsTFhkcFpIUm9QU0l3TGpJaVBpQWdJQ0FnUEdjZ2FXUTlJa0Z5ZEdKdllYSmtMVEVpSUhSeVlXNXpabTl5YlQwaWRISmhibk5zWVhSbEtDMDBOamN1TURBd01EQXdMQ0F0TVRreExqQXdNREF3TUNraVBqeG5JR2xrUFNKemJHbGpaU0lnZEhKaGJuTm1iM0p0UFNKMGNtRnVjMnhoZEdVb01qRTFMakF3TURBd01Dd2dNVEU1TGpBd01EQXdNQ2tpTHo0OGNHRjBhQ0FnSUNBZ0lDQmtQU0pOTkRZNExESXdNaTQxSUVNME5qZ3NNVGsyTGpFME9EY3lOU0EwTnpNdU1UUTROekkxTERFNU1TQTBOemt1TlN3eE9URWdRelE0TlM0NE5URXlOelVzTVRreElEUTVNU3d4T1RZdU1UUTROekkxSURRNU1Td3lNREl1TlNCRE5Ea3hMREl3T0M0NE5URXlOelVnTkRnMUxqZzFNVEkzTlN3eU1UUWdORGM1TGpVc01qRTBJRU0wTnpNdU1UUTROekkxTERJeE5DQTBOamdzTWpBNExqZzFNVEkzTlNBME5qZ3NNakF5TGpVZ1dpQk5ORGd3TGpZMU5qZzFOQ3d4T1RZdU9EUXpNVFEySUV3ME9ESXVNRGN4TURZNExERTVPQzR5TlRjek5Ua2dURFEzTnk0NE1qZzBNamNzTWpBeUxqVWdURFE0TWk0d056RXdOamdzTWpBMkxqYzBNalkwTVNCTU5EZ3dMalkxTmpnMU5Dd3lNRGd1TVRVMk9EVTBJRXcwTnpVc01qQXlMalVnVERRNE1DNDJOVFk0TlRRc01UazJMamcwTXpFME5pQmFJaUFnSUNBZ0lDQm1hV3hzUFNJallXRmhJaUFnSUNBZ0lDQnBaRDBpWTJseVkyeGxMVzVsZUhRdFlYSnliM2N0WkdselkyeHZjM1Z5WlMxbmJIbHdhQ0lnSUNBZ0lDQWdkSEpoYm5ObWIzSnRQU0owY21GdWMyeGhkR1VvTkRjNUxqVXdNREF3TUN3Z01qQXlMalV3TURBd01Da2djMk5oYkdVb0xURXNJREVwSUhSeVlXNXpiR0YwWlNndE5EYzVMalV3TURBd01Dd2dMVEl3TWk0MU1EQXdNREFwSUNJdlBqd3ZaejRnSUNBOEwyYytJRHd2YzNablBnPT1cIlxuICAgIFtoaWRkZW5dPVwiIXJpZ2h0QXJyb3dWaXNpYmxlXCJcbiAgICAoY2xpY2spPVwibmF2aWdhdGUoMSwgZmFsc2UpXCIgLz5cblxuICA8ZGl2IGNsYXNzPVwiYnV0dG9uQ29udGFpbmVyXCI+XG4gICAgPGltZ1xuICAgICAgY2xhc3M9XCJhY3Rpb24gY2xvc2VcIlxuICAgICAgc3JjPVwiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCb1pXbG5hSFE5SWpNd2NIZ2lJR2xrUFNKTVlYbGxjbDh4SWlCemRIbHNaVDBpWlc1aFlteGxMV0poWTJ0bmNtOTFibVE2Ym1WM0lEQWdNQ0ExTVRJZ05URXlPeUlnZG1WeWMybHZiajBpTVM0eElpQm1hV3hzUFNJallXRmhJaUIyYVdWM1FtOTRQU0l3SURBZ05URXlJRFV4TWlJZ2QybGtkR2c5SWpJMGNIZ2lJSGh0YkRwemNHRmpaVDBpY0hKbGMyVnlkbVVpSUhodGJHNXpQU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh5TURBd0wzTjJaeUlnZUcxc2JuTTZlR3hwYm1zOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6RTVPVGt2ZUd4cGJtc2lQaUFnUEhCaGRHZ2dJQ0FnYzNSeWIydGxMWGRwWkhSb1BTSXpNQ0lnYzNSeWIydGxQU0lqTkRRMElpQWdJQ0JrUFNKTk5ETTNMalVzTXpnMkxqWk1NekEyTGprc01qVTJiREV6TUM0MkxURXpNQzQyWXpFMExqRXRNVFF1TVN3eE5DNHhMVE0yTGpnc01DMDFNQzQ1WXkweE5DNHhMVEUwTGpFdE16WXVPQzB4TkM0eExUVXdMamtzTUV3eU5UWXNNakExTGpGTU1USTFMalFzTnpRdU5TQWdZeTB4TkM0eExURTBMakV0TXpZdU9DMHhOQzR4TFRVd0xqa3NNR010TVRRdU1Td3hOQzR4TFRFMExqRXNNell1T0N3d0xEVXdMamxNTWpBMUxqRXNNalUyVERjMExqVXNNemcyTGpaakxURTBMakVzTVRRdU1TMHhOQzR4TERNMkxqZ3NNQ3cxTUM0NUlDQmpNVFF1TVN3eE5DNHhMRE0yTGpnc01UUXVNU3cxTUM0NUxEQk1NalUyTERNd05pNDViREV6TUM0MkxERXpNQzQyWXpFMExqRXNNVFF1TVN3ek5pNDRMREUwTGpFc05UQXVPU3d3UXpRMU1TNDFMRFF5TXk0MExEUTFNUzQxTERRd01DNDJMRFF6Tnk0MUxETTROaTQyZWlJdlBqd3ZjM1puUGc9PVwiXG4gICAgICAoY2xpY2spPVwiY2xvc2VWaWV3ZXIoKVwiIC8+XG4gIDwvZGl2PlxuXG4gIDxkaXZcbiAgICBjbGFzcz1cImltYWdlQ29udGFpbmVyXCJcbiAgICAoY2xpY2spPVwic2hvd05hdmlnYXRpb25BcnJvd3MoKVwiXG4gICAgKHN3aXBlbGVmdCk9XCJuYXZpZ2F0ZSgxLCAkZXZlbnQpXCJcbiAgICAoc3dpcGVyaWdodCk9XCJuYXZpZ2F0ZSgtMSwgJGV2ZW50KVwiXG4gICAgKHBhbik9XCJwYW4oJGV2ZW50KVwiPlxuICAgIDxkaXZcbiAgICAgICpuZ0Zvcj1cImxldCBpbWcgb2YgaW1hZ2VzOyBsZXQgaiA9IGluZGV4XCJcbiAgICAgIGNsYXNzPVwiaW1hZ2VcIlxuICAgICAgW2NsYXNzLmFjdGl2ZV09XCJpbWdbJ2FjdGl2ZSddXCJcbiAgICAgIFtzdHlsZS5iYWNrZ3JvdW5kLWltYWdlXT1cInNhbml0aXplZEltYWdlVXJsKGltZywgailcIlxuICAgICAgW3N0eWxlLmxlZnRdPVwidHJhbnNmb3JtICsgJ3B4J1wiXG4gICAgICBbQGltYWdlVHJhbnNpdGlvbl09XCJpbWdbJ3RyYW5zaXRpb24nXVwiPjwvZGl2PlxuXG4gICAgPGltZ1xuICAgICAgKm5nRm9yPVwibGV0IGltZyBvZiBpbWFnZXM7IGxldCBqID0gaW5kZXhcIlxuICAgICAgY2xhc3M9XCJwcmVsb2FkaW5nLWltYWdlXCJcbiAgICAgIChsb2FkKT1cImltYWdlTG9hZGVkKGltZylcIlxuICAgICAgc3JjPVwie3sgbWF0aC5hYnMoY3VycmVudElkeCAtIGopIDw9IDEgPyBpbWdbJ3Jlc29sdXRpb25zJ11bY2F0ZWdvcnlTZWxlY3RlZF1bJ3BhdGgnXSA6ICcnIH19XCIgLz5cbiAgPC9kaXY+XG48L2Rpdj5cbiJdfQ==