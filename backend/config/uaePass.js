module.exports = {
  clientId: process.env.UAE_PASS_CLIENT_ID,
  clientSecret: process.env.UAE_PASS_CLIENT_SECRET,
  redirectUri: process.env.UAE_PASS_REDIRECT_URI,
  authUrl: process.env.UAE_PASS_AUTH_URL || 'https://stg-id.uaepass.ae/idshub/authorize',
  tokenUrl: process.env.UAE_PASS_TOKEN_URL || 'https://stg-id.uaepass.ae/idshub/token',
  userInfoUrl: process.env.UAE_PASS_USERINFO_URL || 'https://stg-id.uaepass.ae/idshub/userinfo',
  logoutUrl: process.env.UAE_PASS_LOGOUT_URL || 'https://stg-id.uaepass.ae/idshub/logout',
  scope: 'urn:uae:digitalid:profile:general',
  acrValues: 'urn:safelayer:tws:policies:authentication:level:low',
};
