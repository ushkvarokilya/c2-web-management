import {
  Component, OnInit, Input, Output, OnChanges, EventEmitter
} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: 'modal.component.html',
  styleUrls: ['modal.component.scss']
})

export class ModalComponent implements OnInit {

  @Input() closable = true;
  @Input() size = 'medium';
  @Input() visible: boolean;
  @Input() header: string = undefined;
  @Input() removePdding: Boolean = false;
  @Input() greenHeader: Boolean = false;

  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() modalClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() { }

  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.modalClosed.emit();
  }
}

