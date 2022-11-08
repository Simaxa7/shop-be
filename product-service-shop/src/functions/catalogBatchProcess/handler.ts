import { middyfy } from '@libs/lambda';
import { SQSEvent } from 'aws-lambda';
import { v4 } from "uuid";

const { DynamoDB, SNS } = require('aws-sdk');

export const catalogBatchProcess = async (event: SQSEvent) => {
    console.log('catalogBatchProcess start, event: ', event);
    console.log('catalogBatchProcess start, event.Records: ', event.Records);

    const TableName = 'wallpaperTable2';
    const db = new DynamoDB.DocumentClient()
    const sns = new SNS({ region: 'eu-west-3' });
    try {
        for(const prod of event.Records){
            let result = prod.body.replace('\ufeff', '')
            const {title, description, image, price, count} = JSON.parse(result)
            console.log('catalogBatchProcess prod: ',  prod);
            console.log('catalogBatchProcess prod.body: ',  prod.body);

            const uuid: string = v4();
            const item = {
                  id: uuid,
                  title,
                  description,
                  price,
                  image,
                  creationDate: Date.now(),
                  count,
                };
            console.log('add item to db----', prod);

            await db.put({
                TableName,
                Item: item,
            }).promise();

            console.log('added item----', item);
        }

        sns.publish(
            {
                Subject: 'Products uploaded',
                Message: 'New products uploaded',
                TopicArn: 'arn:aws:sns:eu-west-3:201417995229:SNSTopic',
            },
            () => {
                console.log('Email send');
            }
        );
    }catch(e){
        console.log('catalogBatchProcess error----', e);
    }
};

export const main = middyfy(catalogBatchProcess);
