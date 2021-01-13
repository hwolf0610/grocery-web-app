import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-thankyou-page',
  templateUrl: './thankyou-page.component.html',
  styleUrls: ['./thankyou-page.component.scss']
})
export class ThankyouPageComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      window.location.href = 'home';
    }, 3000);
  }

}
