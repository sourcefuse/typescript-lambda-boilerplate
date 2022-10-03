import {APIGatewayEvent, Callback, Context} from 'aws-lambda';
import {LambdaLog} from 'lambda-log';
import {LambdaFunction} from './main';
import {STATUS_CODES} from './common/constants';

const logger = new LambdaLog();

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
