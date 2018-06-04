import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { Router, ActivatedRoute } from '@angular/router';

import { AppState } from '../../store/appState';
import { ComplexService } from '../../services/complex.service';

@Component({
  selector: 'tenants-page',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss']
})

export class TenantsPageComponent implements OnInit {

  @select() company$;

  dataLoaded;
  editableLeases;
  searchQuery;
  aptNumLabel;
  view = "LEASES";
  // view = "ADDTENANTS";

  constructor(private redux: NgRedux<AppState>, private complexService: ComplexService, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if(params.add) this.view = "ADDTENANTS"
      if(params.searchQuery) this.searchQuery = params.searchQuery;
    })
  }

  setAptNumLabel($event){
    this.aptNumLabel = $event;
  }
  onEditLease($event){
    this.editableLeases = $event;
    this.view = "ADDTENANTS"
  }
  
}
