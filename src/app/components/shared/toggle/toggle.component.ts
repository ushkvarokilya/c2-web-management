import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
  <div class="thapps-toggle" [ngClass]="{'on': on, 'off': !on}" (click)="on = !on">
    <div class="toggle-button"></div>
  </div>
  `,
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent implements OnInit {

  private _on: boolean = false
  @Input()
  get on(): boolean {
    return this._on
  }
  set on(value: boolean) {
    this._on = value
    this.onChange.emit(value)
  }
  @Output() onChange = new EventEmitter<boolean>()

  constructor() { }

  ngOnInit() {
  }

}
