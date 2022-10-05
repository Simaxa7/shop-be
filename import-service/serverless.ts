import type { AWS } from "@serverless/typescript";

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';

const uploadBucket = 'products-upload-bucket1';

const serverlessConfiguration: AWS = {
  service: "import-service",
  frameworkVersion: "3",
  plugins: ["serverless-esbuild"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      BUCKET_NAME: {
        Ref: 'productsUploadBucket1',
      }
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
        ],
      },
    },
  },
  resources: {
    Resources: {
      productsUploadBucket1: {
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
      productsUploadBucketPolicy: {
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
