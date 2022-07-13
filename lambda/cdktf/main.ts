import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {App} from 'cdktf';
import {ApiGatewayLambdaStack} from './common';
import {resolve} from 'path';


dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});


const app = new App();

new ApiGatewayLambdaStack(app, 'api-gw-lambda-example', {
  path: resolve(__dirname,'../dist/src'),
  handler: 'index.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../dist/layers/layers.zip')
});


app.synth();