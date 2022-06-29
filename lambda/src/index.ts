import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {LambdaLog} from 'lambda-log';
import {LambdaFunction} from './main';
import {STATUS_CODES} from './common/constants';

const logger = new LambdaLog();

export const handler = (event: APIGatewayEvent, context: Context): APIGatewayProxyResult => {
	const lambdaFunction = new LambdaFunction(event, context);
	try {
		return lambdaFunction.main();
	} catch (error) {
		const message = error.message as string;
		logger.error(message);
		return {
			statusCode: STATUS_CODES.INTERNAL_SERVER,
			body: JSON.stringify({
				message,
			}),
		};
	}
};

