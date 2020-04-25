import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// DONE
//const jwksUrl = 'https://nutchawit.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIJTSTjLaNsZWc0MA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMTE251dGNoYXdpdC5hdXRoMC5jb20wHhcNMjAwMzE5MTE1NzEzWhcNMzMxMTI2
MTE1NzEzWjAeMRwwGgYDVQQDExNudXRjaGF3aXQuYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwZylac4wHu1QG/aT04mk+FNv0YNBMhz2
6/M7QjHtgvnro7JHmgJELJ2Z5OUuanFoWjPmKTEUbJq315Epd1sMQAWlc/mOD709
Kzlvvs/5ilFk7PLmMHbONAS4vhqDCptNSF7+nV6lmItkBl2pLYKyDueAtoT91U37
giKwGo6nh2HITvVJWz2br4zeMrLFNfs+TgvIcHZdAHiievMe7039W2uVlNFqiFf4
qNbtvKp7wOFOqx2QwB2r4V/je/o6sqks+RM6eGC79KhFRsaeNkKI8UaTtQGViK+R
Za49Jogkq/SFd4ztrKlyZa8A9o+YVX3gLaTgu4E2HlQS6sd5V3afKwIDAQABo0Iw
QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTPYDJ9bDeXdkUy7GMluC9/FxcC
HjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAGva31QdGPWgvqSc
1y40eX08lNVkcJ2qvyeLJtQS+RS8Uhl9UWglS578wT9r4H7r6nXsUTamrtAJ0+rf
VC4lWbQFurZJeLrbg96ZLNaxb8WZ0EBoiVW4H3r/8sjSabUOwwfyznI2fCM8sxFC
OjSC7akmab3ZM0xHMrn7M9dRnSFI/W9S7RblCt6ap9joayC5b1HxHCMwYk14xGjX
W+NQmK68cL3A4B4F+5DgpL3ysvoYbfZY2oufubsa4aOg8yuz2yE4wqgCyJNBa4wE
3OlCIWTOcpqYA+KLm4U6O0yH/sEQSiVTWaHGqrPyyscqCB0z/TDeP6cnk37+ENR1
wBXojFk=
-----END CERTIFICATE-----
`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken.sub)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User unauthorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload  {
  const token = getToken(authHeader)
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
