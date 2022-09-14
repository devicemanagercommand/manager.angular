import { Component } from '@angular/core';

export const PREFIX = '--';

@Component({
    selector: 'sass-helper',
    template: '<div></div>'
})
export class SassHelperComponent {

    // Read the custom property of body section with given name:
    readProperty(name: string): string {
        const bodyStyles = window.getComputedStyle(document.body);
        return bodyStyles.getPropertyValue(PREFIX + name);
    }
}
