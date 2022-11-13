import type { AWS } from "@serverless/typescript";

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const uploadBucket = 'my-products-upload-bucket';

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  // useDotenv: true,
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
      BUCKET_NAME: {
        Ref: 'ProductsUploadBucket',
      },
      SQS_URL: { Ref: 'catalogItemsQueue' },
      },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: ['s3:ListBucket'],
            Resource: [`arn:aws:s3:::${uploadBucket}`],
          },
          {
            Effect: 'Allow',
            Action: ['s3:*'],
            Resource: [`arn:aws:s3:::${uploadBucket}/*`],
          },
          {
            Effect: 'Allow',
            Action: 'sqs:*',
            Resource: {
              'Fn::GetAtt': ['catalogItemsQueue', 'Arn'],
            },
          },
        ],
      },
    },
  },
  resources: {
    Resources: {
      ProductsUploadBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: uploadBucket,
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedHeaders: ['*'],
                AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
                AllowedOrigins: ['*'],
              },
            ],
          },
        },
      },
      ProductsUploadBucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          Bucket: uploadBucket,
          PolicyDocument: {
            Statement: [
              {
                Effect: 'Allow',
                Principal: {
                  AWS: '*',
                },
                Action: ['*'],
                Resource: [
                  `arn:aws:s3:::${uploadBucket}`,
                  `arn:aws:s3:::${uploadBucket}/*`,
                ],
              },
            ],
          },
        },
      },
      catalogItemsQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      catalogItemsQueuePolicy: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          Queues: [{ Ref: 'catalogItemsQueue' }],
          PolicyDocument: {
            Statement: [
              {
                Action: ['sqs:*'],
                Effect: 'Allow',
                Resource: '*',
              },
            ],
          },
        },
      },
      GatewayResponseUnauthorized: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.WWW-Authenticate': "'Basic'",
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
            },
          ResponseType: "UNAUTHORIZED",
              RestApiId: {
            Ref: "ApiGatewayRestApi"
          },
          StatusCode: "401"
        }
            },
      GatewayResponseForbidden: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
          },
          ResponseType: "ACCESS_DENIED",
          RestApiId: {
            Ref: "ApiGatewayRestApi"
          },
          StatusCode: "403"
        }
      }
    },
    Outputs: {
      ImportServiceSQSarn: {
        Value: { 'Fn::GetAtt': ['catalogItemsQueue', 'Arn'] },
      },
    },
  },
  functions: { importProductsFile, importFileParser},
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
