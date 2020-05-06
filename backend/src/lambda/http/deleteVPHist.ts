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

  console.log('Delete VPHist by userId=', VPHistTmp.userId, ', createdAt=', VPHistTmp.createdAt)

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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,Access-Control-Allow-Origin,Access-Control-Allow-Credentials,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
    },
    body: ""
  }
}
