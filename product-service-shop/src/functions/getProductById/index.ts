// import schema from './schema';
// maybe we can add ./schema

import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'product/{productId}',
        cors: true,
        request: {
          parameters: {
            paths:
                {
                  productId: true
                }
            },
        },
      },
    },
  ],
};


