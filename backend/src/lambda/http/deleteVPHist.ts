import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const VPHistTable = process.env.HISTORY_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const historyId = event.pathParameters.historyId

  console.log('Delete VPHist', historyId)

  const todoById = await docClient.query({
    TableName : VPHistTable,
    KeyConditionExpression: 'historyId = :historyId',
    ExpressionAttributeValues: {
        ':historyId': historyId
    }
  }).promise()

  const VPHistTmp = todoById.Items[0]
  console.log(VPHistTmp)

  console.log('Delete TODO by userId=', VPHistTmp.userId, ', createdAt=', VPHistTmp.createdAt)

  await docClient
  .delete({
    TableName: VPHistTable,
    Key: {
      "historyId" : VPHistTmp.historyId,
      "createdAt" : VPHistTmp.createdAt
    }})
  .promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
