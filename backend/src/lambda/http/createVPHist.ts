import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateVPHistRequest } from '../../requests/CreateVPHistRequest'
import { parseUserId } from '../../auth/utils'
import * as uuid from 'uuid'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const VPHistTable = process.env.HISTORY_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Creating VPHist')

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)

  const newVPHist: CreateVPHistRequest = JSON.parse(event.body)

  const historyId = uuid.v4()
  const createdAt = new Date().toISOString()

  const newItem = {
    userId,
    historyId,
    createdAt,
    ...newVPHist
  }

  console.log('Creating VPHist=', newItem)

  await docClient
    .put({
      TableName: VPHistTable,
      Item: newItem
    })
    .promise()

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newItem
      })
    }
}
