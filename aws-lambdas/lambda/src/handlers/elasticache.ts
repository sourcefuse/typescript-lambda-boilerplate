import { Callback, Context } from "aws-lambda";
import { createClient } from "redis";

const client = createClient({
    url: process.env.redisEndpoint
  });

client.on("error", (err) => console.log("Redis Client Error", err));

const indentation = 4;
exports.handler = async (
  event: object,
  context: Context,
  callback: Callback
) => {
  await client.connect();
  await client.set("key", "value");
  callback(null, "Success");
};
