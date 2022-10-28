import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import inputOutputLogger from "@middy/input-output-logger";
import errorLogger from "@middy/error-logger";
import httpErrorHandler from "@middy/http-error-handler";

export const middyfy = (handler) => {
  return middy(handler)
    .use(inputOutputLogger())
    .use(errorLogger())
    .use(httpErrorHandler())
    .use(middyJsonBodyParser());
};
