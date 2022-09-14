import { Component } from '@angular/core';
import { TriggerHelper } from '../../../services/shared/helper.service';

@Component({
  selector: 'privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  animations: [TriggerHelper.opacityPageWithNav("routeAnimation")]
})

export class PrivacyPolicyComponent {
  constructor() {
  }
}
