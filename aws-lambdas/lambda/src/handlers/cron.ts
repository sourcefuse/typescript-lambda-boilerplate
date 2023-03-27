import { Callback, Context } from "aws-lambda";
import { LambdaLog } from "lambda-log";

const logger = new LambdaLog();
const indentation = 2;

export class LambdaFunction {
  context?: Context;
  event: object;

  constructor(event: object, context?: Context) {
    this.context = context;
    this.event = event;
  }

  main() {
    logger.info(
      `Received event: ${JSON.stringify(this.event, null, indentation)}`
    );
    logger.info(`Context: ${JSON.stringify(this.context, null, indentation)}`);
    return "Success";
  }
}

export const handler = (
  event: object,
  context: Context,
  callback: Callback
) => {
  const lambdaFunction = new LambdaFunction(event, context);
  try {
    callback(null, lambdaFunction.main());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "something went bad";
    logger.error(message);
    callback(null, message);
  }
};
