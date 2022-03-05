import { Component, OnInit } from '@angular/core';
import { GlobalsService } from "../services/globals.service"
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

// jquery support
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // search text
  searchText: string = "";

  // default constructor
  constructor(public globalsService: GlobalsService, private router: Router) { }

  ngOnInit() {
  }
  
  // go to search results page
  doSearch(){
    // validate search text
    if (this.searchText == "") return;

    this.router.navigate(['/search/', this.searchText]);

    // reset search text
    this.searchText = "";
  }
}
