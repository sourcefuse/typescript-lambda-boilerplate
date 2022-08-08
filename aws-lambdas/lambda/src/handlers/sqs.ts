import { Context,SQSEvent } from "aws-lambda";
import { STATUS_CODES } from "../common/constants";

exports.handler = async function(event:SQSEvent, context:Context) {
    event.Records.forEach(record => {
      const { body } = record;
      console.log(body);
    });
    return {
        statusCode: STATUS_CODES.OK,
        body: JSON.stringify({
            message: 'hello world from SQS',
        }),
    };
  }
  
