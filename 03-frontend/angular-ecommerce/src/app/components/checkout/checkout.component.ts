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
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { OrderItem } from '../../common/order-item';
import { Order } from '../../common/order';
import { Purchase } from '../../common/purchase';
import e from 'express';
import { environment } from '../../../environments/environment';
import { PaymentInfo } from '../../common/payment-info';

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

  storage: Storage = sessionStorage;

  // initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = '';

  constructor(
    private formBuilder: FormBuilder,
    private luv2ShopFormService: Luv2ShopFormService,
    private cartService: CartService,
    private checkOutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // setup Stripe payment form
    this.setupStripePaymentForm();

this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[a-zA-Z\\s-]+$'),
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[a-zA-Z\\s-]+$'),
        ]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[\\dA-Za-z\\s.,\\-#]+$'),
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
          Validators.pattern('^\\d{5}(?:-\\d{4})?$'),
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(5),
          Luv2ShopValidators.notOnlyWhitespace,
          Validators.pattern('^[\\dA-Za-z\\s.,\\-#]+$'),
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
        // cardType: new FormControl('', [Validators.required]),
        // nameOnCard: new FormControl('', [
        //   Validators.required,
        //   Validators.minLength(2),
        //   Luv2ShopValidators.notOnlyWhitespace,
        //   Validators.pattern('^[a-zA-Z\\s-]+$'),
        // ]),
        // cardNumber: new FormControl('', [
        //   Validators.required,
        //   Validators.pattern('[0-9]{16}'),
        // ]),
        // securityCode: new FormControl('', [
        //   Validators.required,
        //   Validators.pattern('[0-9]{3}'),
        // ]),
        // expirationMonth: [''],
        // expirationYear: [''],
      }),
    });

    // Subscribe to valueChanges to capitalize words in the form fields
    this.firstName?.valueChanges.subscribe((value: string) => {
      this.firstName?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.lastName?.valueChanges.subscribe((value: string) => {
      this.lastName?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.creditCardNameOnCard?.valueChanges.subscribe((value: string) => {
      this.creditCardNameOnCard?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.shippingAddressStreet?.valueChanges.subscribe((value: string) => {
      this.shippingAddressStreet?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.shippingAddressCity?.valueChanges.subscribe((value: string) => {
      this.shippingAddressCity?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.billingAddressStreet?.valueChanges.subscribe((value: string) => {
      this.billingAddressStreet?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    this.billingAddressCity?.valueChanges.subscribe((value: string) => {
      this.billingAddressCity?.setValue(this.capitalizeWords(value), {
        emitEvent: false,
      });
    });

    // // populate credit card months
    // const startMonth: number = new Date().getMonth() + 1;
    // console.log('startMonth: ' + startMonth);
    // this.luv2ShopFormService
    //   .getCreditCardMonths(startMonth)
    //   .subscribe((data: any) => {
    //     console.log('Credit card months: ' + JSON.stringify(data));
    //     this.creditCardMonths = data;
    //   });

    // // populate credit card years
    // this.luv2ShopFormService.getCreditCardYears().subscribe((data: any) => {
    //   console.log('Retrieved credit card years: ' + JSON.stringify(data));
    //   this.creditCardYears = data;
    // });

    // populate countries
    this.luv2ShopFormService.getCountries().subscribe((data: any) => {
      console.log('Retrieved countries: ' + JSON.stringify(data));
      this.countries = data;
    });
  }
  setupStripePaymentForm() {
    // get a handle to stripe elements
    var elements = this.stripe.elements();

    // Create a card element... and hide the postal code field
    this.cardElement = elements.create('card', {hidePostalCode: true});

    // add an instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    // add event bindings for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      const displayError = document.getElementById('card-errors');

      if (event.complete) {
        displayError!.textContent = '';
      } else if (event.error) {
        // show validation error to the customer
        this.displayError.textContent = event.error.message;
      }
    });
  }

  reviewCartDetails() {
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe((totalQuantity: number) => {
      this.totalQuantity = totalQuantity;
    });

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe((totalPrice: number) => {
      this.totalPrice = totalPrice;
    });
  }

  get firstName() {
    return this.checkoutFormGroup?.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutFormGroup?.get('customer.lastName');
  }
  get email() {
    return this.checkoutFormGroup?.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup?.get('shippingAddress.street');
  }
  get shippingAddressCity() {
    return this.checkoutFormGroup?.get('shippingAddress.city');
  }
  get shippingAddressState() {
    return this.checkoutFormGroup?.get('shippingAddress.state');
  }
  get shippingAddressCountry() {
    return this.checkoutFormGroup?.get('shippingAddress.country');
  }
  get shippingAddressZipCode() {
    return this.checkoutFormGroup?.get('shippingAddress.zipCode');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup?.get('billingAddress.street');
  }
  get billingAddressCity() {
    return this.checkoutFormGroup?.get('billingAddress.city');
  }
  get billingAddressState() {
    return this.checkoutFormGroup?.get('billingAddress.state');
  }
  get billingAddressCountry() {
    return this.checkoutFormGroup?.get('billingAddress.country');
  }
  get billingAddressZipCode() {
    return this.checkoutFormGroup?.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.checkoutFormGroup?.get('creditCard.creditCardType');
  }
  get creditCardNameOnCard() {
    return this.checkoutFormGroup?.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutFormGroup?.get('creditCard.cardNumber');
  }
  get creditCardSecurityCode() {
    return this.checkoutFormGroup?.get('creditCard.securityCode');
  }

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
      return;
    }

    // set up order
    let order = new Order(this.totalQuantity, this.totalPrice);

    // get cart items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cart items
      // - long way
        // let orderItems: OrderItem[] = [];
       // for (let i = 0; i < cartItems.length; i++) {
       //   orderItems[i] = new OrderItem(cartItems[i]);
        // }
      // - short way
      let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase?.shippingAddress?.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase?.shippingAddress?.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase?.billingAddress?.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase?.billingAddress?.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = this.totalPrice * 100;

    // if valid form then
    // -create payment intent
    // -confirm card payment
    // -place order

    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === '') {
      this.checkOutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement
              }
            }, {handleActions: false})
            .then((result: any) => {
              if (result.error) {
                // inform the customer that there was an error with the payment
                alert(`There was an error with your payment: ${result.error.message}`);
              } else {
                // call the REST API via the CheckoutService
                this.checkOutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    // reset cart
                    this.resetCart();
                  },
                  error: (error: any) => {
                    alert(`There was an error: ${error.message}`);
                  }
                })
              }
            })
        }
      )
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      this.scrollToTop(); // Scroll to the top if the form is invalid
      return;
    }

  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form data
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl('/products');
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

  capitalizeWords(value: string): string {
    if (!value) return value;

    // Use a regular expression to match words separated by spaces or hyphens
    return value
      .split(/(\s|-)/) // Split by spaces or hyphens but keep them in the array
      .map((word) => {
        // If the word is a separator, return it as-is
        if (word === ' ' || word === '-') return word;
        // Otherwise, capitalize the word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(''); // Join back together without additional spaces
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
