import { APIGatewayProxyResult } from "aws-lambda";
import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { v4 } from "uuid";
import { productService } from "../../services";
import validator from "@middy/validator";

const inputSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        price: { type: "number" },
        image: { type: "string" },
        count: { type: "number" },
      },
    },
  },
};

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

const createProduct: ValidatedEventAPIGatewayProxyEvent<
  typeof inputSchema
> = async (event): Promise<APIGatewayProxyResult> => {
  const uuid: string = v4();
  // @ts-ignore
  const { title, description, image, price, count } = event.body;

  console.log(
    `POST request: {
        title: ${title}, 
        description: ${description}, 
        image: ${image},
        price: ${price},
        count: ${count}
      }`
  );

  try {
    const sendingItem = {
      id: uuid,
      title,
      description,
      price,
      image,
      creationDate: Date.now(),
      count,
    };

    // @ts-ignore
    const newProduct = await productService.createProduct(sendingItem);
    console.log("createProduct newProduct", newProduct);

    return formatJSONResponse(200, newProduct);
  } catch (e) {
    console.error("Error during database request executing", e);
    return formatJSONResponse(500, e);
  }
};

export const main = middyfy(createProduct).use(
  validator({ inputSchema, outputSchema })
);
