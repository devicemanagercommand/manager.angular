import { Component } from '@angular/core';
import { LangService } from '../../../services/shared/lang.service'
import { CarouselModule } from 'ngx-bootstrap/carousel'

@Component({
  selector: 'about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})

export class AboutComponent {
  constructor(public rs: LangService) {

  }
}
