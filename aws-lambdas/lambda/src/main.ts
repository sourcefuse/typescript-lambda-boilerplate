import { APIGatewayEvent, Context } from "aws-lambda";
import { LambdaLog } from "lambda-log";
import { STATUS_CODES } from "./common/constants";

const logger = new LambdaLog();
const indentation = 2;
export class LambdaFunction {
  context?: Context;
  event: APIGatewayEvent;

  constructor(event: APIGatewayEvent, context?: Context) {
    this.context = context;
    this.event = event;
  }

  async main() {
    logger.info(`Event: ${JSON.stringify(this.event, null, indentation)}`);
    logger.info(`Context: ${JSON.stringify(this.context, null, indentation)}`);

    return {
      statusCode: STATUS_CODES.OK,
      body: JSON.stringify({
        message: "hello world",
      }),
    };
  }
}
