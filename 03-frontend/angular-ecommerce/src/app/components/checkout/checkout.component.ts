import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Luv2ShopFormService } from '../../services/luv2-shop-form.service';
import { log } from 'console';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService
  ) {}

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: [''],
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

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    log('startMonth: ' + startMonth);
    this.luv2ShopFormService
      .getCreditCardMonths(startMonth)
      .subscribe((data) => {
        log('Credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      });

    // populate credit card years
    this.luv2ShopFormService
      .getCreditCardYears()
      .subscribe(data => {
        log('Retrieved credit card years: ' + JSON.stringify(data));
        this.creditCardYears = data;
      });
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log(
      'The shipping address is ' +
        this.checkoutFormGroup.get('shippingAddress')?.value
    );
  }
}
