import { Context,SNSEvent } from "aws-lambda";

exports.handler = function(event:SNSEvent, context:Context, callback:any) {
        console.log('Received event:', JSON.stringify(event, null, 4));
        var message = event.Records[0].Sns.Message;
        console.log('Message received from SNS:', message);
        callback(null, "Success");
    };
