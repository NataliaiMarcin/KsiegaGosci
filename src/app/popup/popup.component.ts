import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PopupService } from '../Services/popup.service';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input() id?: string;
  isOpen = false;
  private element: any;
  @Input() center: boolean = false;
  @Output()
  onClose: EventEmitter<any> = new EventEmitter();

  constructor(private popupService: PopupService, private el: ElementRef) {
      this.element = el.nativeElement;
  }

  ngOnInit() {
      // add self (this modal instance) to the modal service so it can be opened from any component
      this.popupService.add(this);

      // move element to bottom of page (just before </body>) so it can be displayed above everything else
      document.body.appendChild(this.element);

      // close modal on background click
    //   this.element.addEventListener('click', (el: any) => {
    //       if (el.target.className === 'jw-modal') {
    //           this.close();
    //       }
    //   });
  }

  ngOnDestroy() {
      // remove self from modal service
      this.popupService.remove(this);

      // remove modal element from html
      this.element.remove();
  }

  open() {
      this.element.style.display = 'block';
      document.body.classList.add('jw-modal-open');
      this.isOpen = true;
  }

  close() {
      this.element.style.display = 'none';
      document.body.classList.remove('jw-modal-open');
      this.isOpen = false;
      this.onClose.emit(true);
  }
}
