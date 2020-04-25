import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Updating TODO')

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const existingTodos = await docClient.query({
    TableName : todosTable,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
  }).promise()

  const existingTodo = existingTodos.Items[0]
  console.log(existingTodo)

  console.log('Delete existing TODO by todoId=', existingTodo.todoId, ', createdAt=', existingTodo.createdAt)

  await docClient
  .delete({
    TableName: todosTable,
    Key: {
      "todoId" : existingTodo.todoId,
      "createdAt" : existingTodo.createdAt
    }})
  .promise()

  console.log('Update new TODO property')
  existingTodo.name = updatedTodo.name
  existingTodo.dueDate = updatedTodo.dueDate
  existingTodo.done = updatedTodo.done

  console.log('Create TODO by todoId=', existingTodo.todoId, ', createdAt=', existingTodo.createdAt)
  await docClient
  .put({
    TableName: todosTable,
    Item: existingTodo
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
