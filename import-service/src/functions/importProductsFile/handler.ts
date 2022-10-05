import {
  formatJSONResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as AWS from 'aws-sdk';

const importProductsFile = async (event) => {
  console.log('start process importProductsFile');

  const BucketName = process.env.BUCKET_NAME;
  const s3 = new AWS.S3({ region: 'eu-west-1' });

  try {
    console.log('event = ', event);
    console.log('BucketName = ', BucketName);

    const signedUrl = s3.getSignedUrl('putObject', {
      Bucket: BucketName,
      Key: `uploaded/${event.queryStringParameters.name}`,
      Expires: 60,
      ContentType: 'text/csv',
    });

    console.log('signedUrl = ', signedUrl);

    return formatJSONResponse(200, signedUrl);
  } catch (e) {
    console.error("Error", e);
    return formatJSONResponse(500, e);
  }
};

export const main = middyfy(importProductsFile);
