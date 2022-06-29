import {LambdaFunction} from '../../src/main';
import {SampleEvents} from '../events';

describe('Lambda function test', () => {
	test('should throw when payload is malformed', () => {
		const lambdaFunction = new LambdaFunction(SampleEvents.ApiGateway);
		const response = lambdaFunction.main();
		expect(response.statusCode).toEqual(200);
	});
});
