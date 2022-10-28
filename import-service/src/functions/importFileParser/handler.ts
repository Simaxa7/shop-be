import {
  formatJSONResponse,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { S3Event} from 'aws-lambda';
import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

const importFileParser = async (event: S3Event) => {
  console.log('start process importFileParser', JSON.stringify(event.Records));

  const BucketName = process.env.BUCKET_NAME;
  const s3 = new AWS.S3({ region: 'eu-west-3' });

  const SQS_URL = process.env.SQS_URL;
  const sqs = new AWS.SQS();

  try {
    for (const record of event.Records) {
      console.log('record: ', record);

      const key = record.s3.object.key;
      console.log('key: ', key);

      const paramsDefault = {
         Bucket: BucketName,
         Key: key,
      }
      console.log('paramsDefault: ', paramsDefault);

      const paramsCopyObject = {
        Bucket: BucketName,
        CopySource: `${BucketName}/${key}`,
        Key: 'parsed',
      }
      console.log('paramsCopyObject: ', paramsCopyObject);

      const s3Stream = s3
          .getObject(paramsDefault)
          .createReadStream();

      await new Promise((resolve, reject) => {
        console.log('s3Stream: ');

        s3Stream
          .pipe(csv())
          .on('data', async(data) => {
            console.log('data: ', data);

            let res = await sqs
                .sendMessage({
                  QueueUrl: SQS_URL,
                  MessageBody: JSON.stringify(data),
                })
                .promise();
            console.log('SENDED!!!', res);
          })
          .on('error', (error) => {
            console.log('error:', error);
            reject('ERROR: ' + error);
          })
          .on('end', async () => {
            console.log('file was parsed:');

            console.log('start of copying...');
            await s3
                .copyObject(paramsCopyObject)
                .promise();
            console.log('Copied.');

            console.log('start of deletion...');
            await s3
                .deleteObject(paramsDefault)
                .promise();

            console.log('the file was deleted from the folder "updated".');

            resolve('the file was parsed.');
          });
        });
      }
    return formatJSONResponse(200, 'file was parsed');
  } catch (e) {
    console.error("Error", e);
    return formatJSONResponse(500, e);
  }
};

export const main = middyfy(importFileParser);
