// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '01bsrs6pi4'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'nutchawit.auth0.com',            // Auth0 domain
  clientId: 'KMaym6pCRt6EA2VWMml9U643MyOryv61',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
