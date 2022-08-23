import { formatJSONResponse } from '@libs/api-gateway';

import { getProductById } from "@functions/products";

const getProductItem = async (event) => {
  console.log('getProductItem event', event)

  if (!event?.pathParameters?.productId) {
    return {
      statusCode: 400,
      message: 'error ID'
    }
  }
  if (event.pathParameters.productId){
    // @ts-ignore
    return formatJSONResponse(getProductById(event.pathParameters.productId));
  }
};

export const main = getProductItem;
