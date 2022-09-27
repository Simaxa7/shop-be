import { DocumentClient } from "aws-sdk/clients/dynamodb";

export default interface IProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  creationDate: number;
  count: number;
}

export default class ProductService {
  private tableName: string = "wallpaperTable2";

  constructor(private docClient: DocumentClient) {}

  async getAllProducts(): Promise<IProduct[]> {
    const productsList = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return productsList.Items as IProduct[];
  }

  async getProduct(id: string): Promise<IProduct> {
    const product = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();

    return product.Item as IProduct;
  }

  async createProduct(product: IProduct): Promise<IProduct> {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: product,
      })
      .promise();

    return product;
  }
}
