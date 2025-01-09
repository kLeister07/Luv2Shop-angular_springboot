import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaymentInfo } from '../common/payment-info';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = environment.luv2shopApiUrl + 'checkout/purchase';

  private paymentIntentUrl = environment.luv2shopApiUrl + 'checkout/payment-intent';

  constructor(private hhtpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.hhtpClient.post<Purchase>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo ): Observable<any> {
    return this.hhtpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo);
  }
}
