import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, UntypedFormControl } from '@angular/forms';

@Directive({
    selector: '[customMax][formControlName],[customMax][formControl],[customMax][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: CustomMaxDirective, multi: true }]
})
export class CustomMaxDirective implements Validator {
    @Input()
    customMax: number;

    validate(c: UntypedFormControl): { [key: string]: any } {
        let v = c.value;
        return (v > +this.customMax) && this.customMax != null ? { "customMax": true } : null;
    }
} 
