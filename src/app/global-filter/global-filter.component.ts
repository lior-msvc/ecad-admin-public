import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-global-filter',
  templateUrl: './global-filter.component.html',
  styleUrls: ['./global-filter.component.sass']
})
export class GlobalFilterComponent implements OnInit {

  // source screen name
  @Input() screenName: string = "";

  // default constructor
  constructor(public globalsService: GlobalsService) { 
    
  }

  ngOnInit() {
    
  }
  
  // reset global filter
  resetFilter() {
    // reset filter fields
    this.globalsService.GlobalFilter.TimeRange = "10";
    this.globalsService.GlobalFilter.ApplicationType = "All";

    this.globalsService.applyGlobalFilter();
  }

  // update global filter
  applyFilter() {
    this.globalsService.applyGlobalFilter();
  }

}
