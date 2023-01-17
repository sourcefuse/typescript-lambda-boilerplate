import { APIGatewayEvent, Context } from "aws-lambda";
import { LambdaLog } from "lambda-log";
import { LambdaFunction } from "./main";

const logger = new LambdaLog();

exports.handler = async function (event: APIGatewayEvent, context: Context) {
  const lambdaFunction = new LambdaFunction(event, context);
  try {
    await lambdaFunction.main();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "something went wrong";
    logger.error(message);
  }
};
