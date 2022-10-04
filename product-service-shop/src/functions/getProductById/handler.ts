import { formatJSONResponse } from "@libs/api-gateway";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
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

const getProductItem = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("getProductItem event", event);

  try {
    const { id } = event.pathParameters;
    const product = await productService.getProduct(id);

    console.log("getProductItem by id:", product);

    if (!product) {
      return formatJSONResponse(404, "error ID");
    }

    return formatJSONResponse(200, product);
  } catch (e) {
    console.error("Error during database request executing", e);
    return formatJSONResponse(500, e);
  }
};

export const main = middyfy(getProductItem).use(validator({ outputSchema }));
