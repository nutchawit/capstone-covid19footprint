import 'source-map-support/register'
import { parseUserId } from '../../auth/utils'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()

const VPHistTable = process.env.HISTORY_TABLE
const VPHistScndIdx = process.env.HISTORY_IDX_NAME

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing Get TODO')

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const userId = parseUserId(jwtToken)

  console.log('Get VPHist by userId=', userId)

  const todos = await getVPHistByUserId(userId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todos
    })
  }
}

async function getVPHistByUserId(userId: string) {
  const result = await docClient.query({
    TableName: VPHistTable,
    IndexName : VPHistScndIdx,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  }).promise()

  return result.Items
}
