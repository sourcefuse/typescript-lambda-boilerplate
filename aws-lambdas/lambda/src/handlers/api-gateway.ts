import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {LambdaLog} from 'lambda-log';
import {STATUS_CODES} from '../common/constants';

const logger = new LambdaLog();

export class LambdaFunction {
	context?: Context;
	event: APIGatewayEvent;

	constructor(event: APIGatewayEvent, context?: Context) {
		this.context = context;
		this.event = event;
	}

	main() {
		logger.info(`Event: ${JSON.stringify(this.event, null, 2)}`);
		logger.info(`Context: ${JSON.stringify(this.context, null, 2)}`);

		return {
			statusCode: STATUS_CODES.OK,
			body: JSON.stringify({
				message: 'hello world',
			}),
		};
	}
}

export const handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
	const lambdaFunction = new LambdaFunction(event, context);
	try {
		callback(null, lambdaFunction.main());
	} catch (error: any) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		const message = error.message as string; //es
		logger.error(message);
		callback(null, {
			statusCode: STATUS_CODES.INTERNAL_SERVER,
			body: JSON.stringify({
				message,
			}),
		});
	}
};
