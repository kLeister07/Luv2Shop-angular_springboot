export default  {
    oidc: {
        clientId: '0oajl4l23dKtaqO6h5d7',
        issuer: 'https://dev-01366707.okta.com/oauth2/default',
        redirectUri: 'http://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email']
    },
    resourceServer: {
        messagesUrl: 'http://localhost:8080/api/messages'
    }
}
