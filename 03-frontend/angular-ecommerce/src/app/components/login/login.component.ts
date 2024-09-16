import { Component, Inject, OnInit } from '@angular/core';
import myAppConfig from '../../config/my-app-config';
import { OktaAuth } from '@okta/okta-auth-js';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaSignIn from '@okta/okta-signin-widget';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes,
      },
      useClassicEngine: true,
    });
  }

  ngOnInit(): void {
    this.oktaSignin.remove();

    this.oktaSignin.renderEl(
      {
        el: '#okta-sign-in-widget', // this name should be same as the div tag id in login.component.html
      },
      (response: any) => {
        if (response.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        throw error;
      }
    );
  }
}


// ngOnInit(): void {
//   // Ensure this code only runs in the browser environment
//   if (typeof window !== 'undefined') {
//     import('@okta/okta-signin-widget').then(module => {
//       const OktaSignIn = module.default;
//       this.oktaSignin = new OktaSignIn({
//         logo: 'assets/images/logo.png',
//         baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
//         clientId: myAppConfig.oidc.clientId,
//         redirectUri: myAppConfig.oidc.redirectUri,
//         authParams: {
//           pkce: true,
//           issuer: myAppConfig.oidc.issuer,
//           scopes: myAppConfig.oidc.scopes,
//         },
//       });

//       this.oktaSignin.remove();

//       this.oktaSignin.renderEl(
//         {
//           el: '#okta-sign-in-widget', // this name should be same as the div tag id in login.component.html
//         },
//         (response: any) => {
//           if (response.status === 'SUCCESS') {
//             this.oktaAuth.signInWithRedirect();
//           }
//         },
//         (error: any) => {
//           throw error;
//         }
//       );
//     }).catch(err => {
//       console.error('Error loading OktaSignIn:', err);
//     });
//   }
// }
// }
