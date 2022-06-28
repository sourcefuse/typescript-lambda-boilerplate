import * as ApiGatewayEvent from './api-gateway-event.json';
import {APIGatewayEvent} from 'aws-lambda';

export const SampleEvents = {
  ApiGateway: ApiGatewayEvent as unknown as APIGatewayEvent,
};