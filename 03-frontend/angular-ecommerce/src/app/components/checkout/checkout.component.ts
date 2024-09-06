import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2-shop-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService
  ) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[a-zA-Z]+$'),
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[a-zA-Z]+$'),
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[\\dA-Za-z\\s.,\\-#]+$')
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[A-Za-z\\s-]+$'),
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.pattern('^\\d{5}(?:-\\d{4})?$')

        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[\\dA-Za-z\\s.,\\-#]+$')
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[A-Za-z\\s-]+$'),
        ]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.pattern('^\\d{5}(?:-\\d{4})?$'),
        ]),
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // Subscribe to valueChanges to capitalize names
    this.firstName?.valueChanges.subscribe((value) => {
      this.firstName?.setValue(this.capitalizeFirstLetter(value), {
        emitEvent: false,
      });
    });

    this.lastName?.valueChanges.subscribe((value) => {
      this.lastName?.setValue(this.capitalizeFirstLetter(value), {
        emitEvent: false,
      });
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);
    this.luv2ShopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data: any) => {
        console.log('Credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });

    // populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe((data: any) => {
      console.log('Retrieved credit card years: ' + JSON.stringify(data));
      this.creditCardYears = data;
    });

    // populate countries
    this.luv2ShopFormService.getCountries().subscribe((data: any) => {
      console.log('Retrieved countries: ' + JSON.stringify(data));
      this.countries = data;
    });
  }

  get firstName() {
    return this.checkoutFormGroup?.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup?.get('customer.lastName');
  }
  get email() {return this.checkoutFormGroup?.get('customer.email');}

  get shippingAddressStreet() {return this.checkoutFormGroup?.get('shippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup?.get('shippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup?.get('shippingAddress.state');}
  get shippingAddressCountry() {return this.checkoutFormGroup?.get('shippingAddress.country');}
  get shippingAddressZipCode() {return this.checkoutFormGroup?.get('shippingAddress.zipCode');}

  get billingAddressStreet() {return this.checkoutFormGroup?.get('billingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup?.get('billingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup?.get('billingAddress.state');}
  get billingAddressCountry() {return this.checkoutFormGroup?.get('billingAddress.country');}
  get billingAddressZipCode() {return this.checkoutFormGroup?.get('billingAddress.zipCode');}



  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      // bug fix for states
      this.billingAddressStates = [];
    }
  }

  onSubmit() {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      this.scrollToTop(); // Scroll to the top if the form is invalid
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log(
      'The email address is ' +
        this.checkoutFormGroup.get('customer')?.value.email
    );

    console.log(
      'The shipping address country is ' +
        this.checkoutFormGroup.get('shippingAddress')?.value.country.name
    );
    console.log(
      'The shipping address state is ' +
        this.checkoutFormGroup.get('shippingAddress')?.value.state.name
    );
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(
      creditCardFormGroup?.value.expirationYear
    );

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.luv2ShopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data: number[]) => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(
      `formGroupName=${formGroupName}, countryCode=${countryCode}, countryName=${countryName}`
    );
    this.luv2ShopFormService.getStates(countryCode).subscribe((data: any[]) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressStates = data;
      } else {
        this.billingAddressStates = data;
      }

      // select first item by default
      formGroup?.get('state')?.setValue(data[0]);
    });
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
