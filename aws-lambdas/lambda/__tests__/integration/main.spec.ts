import {LambdaFunction} from '../../src/handlers/api-gateway';
import {SampleEvents} from '../events';

describe('Lambda function test', () => {
	test('should throw when payload is malformed', () => {
		const lambdaFunction = new LambdaFunction(SampleEvents.ApiGateway);
		const response = lambdaFunction.main();
		expect(response.statusCode).toEqual(200);
	});
});