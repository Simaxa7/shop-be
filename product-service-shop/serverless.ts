import type { AWS } from "@serverless/typescript";

import getProductsList from "@functions/getProductsList";
import getProductItem from "@functions/getProductById";
import addProductItem from "@functions/addProductItem";
import catalogBatchProcess from '@functions/catalogBatchProcess';

const TABLE_WALLPAPER_NAME = "wallpaperTable2";

const serverlessConfiguration: AWS = {
  service: "product-service-shop",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild", "serverless-dynamodb-local"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-3",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      TABLE_NAME: {
        Ref: TABLE_WALLPAPER_NAME,
      },
      SNS_ARN: {
        Ref: 'SNSTopic'
      },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "s3:*",
              "cloudwatch:*",
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            // Resource: `arn:aws:dynamodb:eu-central-1:*:table/${TABLE_WALLPAPER_NAME}`,
            Resource: {
              "Fn::GetAtt": [TABLE_WALLPAPER_NAME, "Arn"],
            },
          },
          {
            Effect: 'Allow',
            Action: ['sns:*'],
            Resource: {
              Ref: 'SNSTopic',
            },
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      wallpaperTable2: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: TABLE_WALLPAPER_NAME,
          KeySchema: [
            {
              KeyType: "HASH",
              AttributeName: "id",
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          // BillingMode: 'PAY_PER_REQUEST',
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'SNSTopic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'simaxa7@gmail.com',
          Protocol: 'email',
          TopicArn: { Ref: 'SNSTopic' },
        },
      },
    },
  },
  functions: {
    getProductsList,
    getProductItem,
    addProductItem,
    catalogBatchProcess,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
