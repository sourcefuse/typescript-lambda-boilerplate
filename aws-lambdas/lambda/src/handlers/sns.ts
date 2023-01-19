import { Callback, Context, SNSEvent } from "aws-lambda";

const indentation = 4;
exports.handler = function (
  event: SNSEvent,
  context: Context,
  callback: Callback
) {
  console.log("Received event:", JSON.stringify(event, null, indentation)); // NOSONAR
  const message = event.Records[0].Sns.Message;
  console.log("Message received from SNS:", message); // NOSONAR
  callback(null, "Success");
};
