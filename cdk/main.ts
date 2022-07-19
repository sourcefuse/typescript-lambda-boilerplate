import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {App} from 'cdktf';
import {LambdaStack} from './common';
import {resolve} from 'path';


dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});


const app = new App();

new LambdaStack(app, 'lambda', {
  path: resolve(__dirname,'../lambda/dist/src'),
  handler: 'index.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../lambda/dist/layers'),
  isApiRequired: true
});


app.synth();