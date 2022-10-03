import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyResult } from "aws-lambda";
import validator from "@middy/validator";
import { middyfy } from "@libs/lambda";
import { productService } from "../../services";

const outputSchema = {
  type: "object",
  required: ["body", "statusCode"],
  properties: {
    body: {
      type: "string",
    },
    statusCode: {
      type: "number",
    },
    headers: {
      type: "object",
    },
  },
};

const getProductsList = async (): Promise<APIGatewayProxyResult> => {
  try {
    const products = await productService.getAllProducts();
    console.log("getProductsList products", products);

    return formatJSONResponse(200, products);
  } catch (e) {
    console.error("Error during database request executing", e);
    return formatJSONResponse(500, e);
  }
};

export const main = middyfy(getProductsList).use(validator({ outputSchema }));
