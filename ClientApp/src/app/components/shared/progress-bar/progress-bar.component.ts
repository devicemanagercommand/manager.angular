import { Component, Input } from '@angular/core';

@Component({
  selector: 'dmc-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
/** progress-bar component*/
export class ProgressBarComponent {
  /** progress-bar ctor */
  @Input() isLoading: boolean;
  constructor() {

  }
}
