import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
// import { middyfy } from '@libs/lambda';

import schema from './schema';
import { getAllProducts } from "@functions/products";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  // @ts-ignore
  return formatJSONResponse(getAllProducts());
};

export const main = getProductsList;
// export const main = middyfy(getProductsList);
