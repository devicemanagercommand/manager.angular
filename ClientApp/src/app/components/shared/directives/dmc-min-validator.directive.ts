import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, UntypedFormControl } from '@angular/forms';

@Directive({
    selector: '[customMin][formControlName],[customMin][formControl],[customMin][ngModel]',
    providers: [{ provide: NG_VALIDATORS, useExisting: CustomMinDirective, multi: true }]
})
export class CustomMinDirective implements Validator {
    @Input()
    customMin: number;

    validate(c: UntypedFormControl): { [key: string]: any } {
        let v = c.value;
        return (v < +this.customMin) && this.customMin != null ? { "customMin": true } : null;
    }
} 
