import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { LangService } from '../../services/shared/lang.service'
import { TriggerHelper } from '../../services/shared/helper.service'
import { ConfigurationService } from '../../services/shared/configuration.service';

@Component({
  host: {
    '[@routeAnimation]': ''
  },
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss'],
  animations: [TriggerHelper.opacityPageWithNav("routeAnimation")]
})
export class HomeComponent {
  constructor(
    public rs: LangService,
    private route: ActivatedRoute,
    private configurationService: ConfigurationService
  ) {
  }

  ngOnInit() {
    this.route.fragment.subscribe(f => {
      console.log("HomeComponent.ngOnInit.route.fragment.suscribe()");
      const element = document.querySelector("#" + f)
      if (element) element.scrollIntoView(true)
    })
  }
}
