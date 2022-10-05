export const formatJSONResponse = (statusCode, response) => {
  console.log("response = ", response);
  return {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode,
    body: JSON.stringify(response),
  };
};
