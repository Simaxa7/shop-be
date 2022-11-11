import { middyfy } from '@libs/lambda';

const basicAuthorizer = async (event) => {
  console.log('basicAuthorizer event: ', event);
  console.log('basicAuthorizer JSON.stringify(event): ', JSON.stringify(event));

  if (event.type !== 'TOKEN') {
    console.log('basicAuthorizer event.type !== TOKEN: not equal');
    throw new Error('Unauthorized error');
  }

  try {
    const { authorizationToken } = event || {};
    console.log('basicAuthorizer authorizationToken: ', authorizationToken);

    const encodedCreds = authorizationToken.split(' ')[1];
    console.log('basicAuthorizer encodedCreds: ', encodedCreds);

    const buff = Buffer.from(encodedCreds, 'base64');
    console.log('basicAuthorizer buff: ', buff);

    const [login, password] = buff.toString('utf-8').split(':');
    console.log(`username: ${login} and password: ${password}`);

    const storedUserPassword = process.env.PASSWORD;
    console.log('storedUserPassword: ', storedUserPassword);

    const storedUserLogin = process.env.LOGIN;
    console.log('storedUserLogin: ',storedUserLogin);

    const effect = storedUserPassword !== password || storedUserLogin !== login ? 'Deny' : 'Allow';
    console.log('effect: ', effect);

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    console.log('policy: ', policy);

    return policy;
  } catch(e){
    throw new Error('authorization error: ', e);
  }
};

function generatePolicy(principalId, resource, effect) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

export const main = middyfy(basicAuthorizer);
