import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  console.log('Generate upload URL', todoId)

  const url = getUploadUrl(todoId)

  await updateImageUrl(todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

async function updateImageUrl(todoId: string){
  const imageId = todoId
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

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

  console.log('Update new TODO imageUrl=', imageUrl)
  existingTodo.attachmentUrl = imageUrl

  console.log('Create TODO by todoId=', existingTodo.todoId, ', createdAt=', existingTodo.createdAt)
  await docClient
  .put({
    TableName: todosTable,
    Item: existingTodo
  })
  .promise()
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
}
