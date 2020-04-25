import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  console.log('Delete TODO', todoId)

  const todoById = await docClient.query({
    TableName : todosTable,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  const todoTmp = todoById.Items[0]
  console.log(todoTmp)

  console.log('Delete TODO by userId=', todoTmp.userId, ', createdAt=', todoTmp.createdAt)

  await docClient
  .delete({
    TableName: todosTable,
    Key: {
      "todoId" : todoTmp.todoId,
      "createdAt" : todoTmp.createdAt
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
