import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateVPHistRequest } from '../../requests/UpdateVPHistRequest'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const VPHistTable = process.env.HISTORY_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Updating VPHist')

  const historyId = event.pathParameters.historyId
  const updatedTodo: UpdateVPHistRequest = JSON.parse(event.body)

  const existingTodos = await docClient.query({
    TableName : VPHistTable,
    KeyConditionExpression: 'historyId = :historyId',
    ExpressionAttributeValues: {
        ':historyId': historyId
    }
  }).promise()

  const existingVPHist = existingTodos.Items[0]
  console.log(existingVPHist)

  console.log('Delete existing VPHist by historyId=', existingVPHist.historyId, ', createdAt=', existingVPHist.createdAt)

  await docClient
  .delete({
    TableName: VPHistTable,
    Key: {
      "historyId" : existingVPHist.historyId,
      "createdAt" : existingVPHist.createdAt
    }})
  .promise()

  console.log('Update new VPHist property')
  existingVPHist.name = updatedTodo.name
  existingVPHist.dueDate = updatedTodo.dueDate
  existingVPHist.done = updatedTodo.done

  console.log('Create VPHist by historyId=', existingVPHist.historyId, ', createdAt=', existingVPHist.createdAt)
  await docClient
  .put({
    TableName: VPHistTable,
    Item: existingVPHist
  })
  .promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ""
  }
}
