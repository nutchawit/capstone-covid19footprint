import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})

const docClient = new AWS.DynamoDB.DocumentClient()
const VPHistTable = process.env.HISTORY_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const historyId = event.pathParameters.historyId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  console.log('Generate upload URL', historyId)

  const url = getUploadUrl(historyId)

  await updateImageUrl(historyId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type,Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

async function updateImageUrl(historyId: string){
  const imageId = historyId
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

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

  console.log('Update new VPHist imageUrl=', imageUrl)
  existingVPHist.attachmentUrl = imageUrl

  console.log('Create VPHist by historyId=', existingVPHist.historyId, ', createdAt=', existingVPHist.createdAt)
  await docClient
  .put({
    TableName: VPHistTable,
    Item: existingVPHist
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
