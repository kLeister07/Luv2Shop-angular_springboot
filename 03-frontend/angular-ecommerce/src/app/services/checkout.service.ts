import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private purchaseUrl = environment.luv2shopApiUrl + 'checkout/purchase';

  constructor(private hhtpClient: HttpClient) {}

  placeOrder(purchase: Purchase): Observable<any> {
    return this.hhtpClient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
