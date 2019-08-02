import { Component, OnInit, ViewChild, Output, ElementRef, EventEmitter, Input } from '@angular/core';
import { environment } from "../../../../environments/environment";
//import {} from 'googlemaps';
declare let google: any;

@Component({
  selector: 'app-google-address',
  template: `
    <input type="text" #inputAutocomplete (change)="onInputChange($event.target.value)"/>
  `,
  styleUrls: ['./google-address.component.scss']
})
export class GoogleAddressComponent implements OnInit {

  private _address: GoogleAddress
  @Input()
  get address(): GoogleAddress {
    return this._address
  }

  set address(val: GoogleAddress) {
    this._address = val
    this.addressChange.emit(val)
    if(this.input) {
      this.input.nativeElement.value = val.address
    }
    if(this.objectWithFlatAddress) {
      Object.assign(this.objectWithFlatAddress, val)
    }
  }
  @Output() addressChange = new EventEmitter<GoogleAddress>();

  @Input() objectWithFlatAddress: ObjectFlatAddress

  @ViewChild("inputAutocomplete") input: ElementRef
  autocomplete: google.maps.places.Autocomplete

  googleInitWaitTime = 0

  constructor() { }

  ngOnInit() {
    this.initAddressAutocomplete()
  }

  onInputChange(value) {
    this.address = {
      latitude: 0,
      longitude: 0,
      address: value
    }
  }

  private initAddressAutocomplete() {
    if (typeof google === "undefined") {
      this.googleInitWaitTime += 100
      setTimeout(() => this.initAddressAutocomplete(), this.googleInitWaitTime)
      return
    }
    this.autocomplete = new google.maps.places.Autocomplete(this.input.nativeElement)
    this.autocomplete.addListener('place_changed', () => {
      var place = this.autocomplete.getPlace();
      let latitude
      let longitude
      if (place.geometry) {
        latitude = place.geometry.location.lat();
        longitude = place.geometry.location.lng();
      }
      let address = place.formatted_address;
      this.address = { latitude, longitude, address }
    })
    if (this.address) {
      this.input.nativeElement.value = this.address.address
    }
  }

}

export interface GoogleAddress {
  latitude: number
  longitude: number
  address: string
}

interface ObjectFlatAddress {
  latitude: number
  longitude: number
  address: string
  [key: string]: any
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractGoogleAddress'
})

export class ExtractGoogleAddressPipe implements PipeTransform {
  transform(object: ObjectFlatAddress): GoogleAddress {
    return {
      address: object.address,
      latitude: object.latitude,
      longitude: object.longitude
    } 
  }
}
