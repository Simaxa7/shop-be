import dynamoDBClient from "../database";
import ProductService from "./productService";

export const productService = new ProductService(dynamoDBClient());
