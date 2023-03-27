import { Callback, Context } from "aws-lambda";
import { LambdaLog } from "lambda-log";
import { createClient } from "redis";

const logger = new LambdaLog();
const indentation = 2;
const client = createClient({
  url: process.env.redisEndpoint,
});
client.on("error", err => logger.error("Redis Client Error", err));

export class LambdaFunction {
  context?: Context;
  event: object;

  constructor(event: object, context?: Context) {
    this.context = context;
    this.event = event;
  }

  async main() {
    await client.connect();
    await client.set("key", "value");
    return "Success";
  }
}

export const handler = async (
  event: object,
  context: Context,
  callback: Callback
) => {
  const lambdaFunction = new LambdaFunction(event, context);
  try {
    const res = await lambdaFunction.main();
    callback(null, res);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "something went bad";
    logger.error(message);
    callback(null, message);
  }
};
