import {Response} from './common';
/**
 * Lambda entry point.
 */
const handler = async(): Promise<Response> => {
	try {
		console.info('Hit lambda handler');
		await Promise.resolve();
		return {
			status: 200
		};
	} catch (error) {
		console.error(error);
		return { status: 500 };
	}
};

export { handler };
