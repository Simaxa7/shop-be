import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        cors: true,
        authorizer: {
          name: 'basicAuthorizer',
          arn: 'arn:aws:lambda:eu-west-3:201417995229:function:authorization-service-dev-basicAuthorizer',
          resultTtlInSeconds: 0,
          identitySource: 'method.request.header.Authorization',
          type: 'token',
        },
      },
    },
  ],
};
