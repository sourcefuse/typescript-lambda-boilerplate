import { Callback, Context } from "aws-lambda";

const indentation = 4;
exports.handler = function (
  event: object,
  context: Context,
  callback: Callback
) {
  console.log("Received event:", JSON.stringify(event, null, indentation)); // NOSONAR
  callback(null, "Success");
};
