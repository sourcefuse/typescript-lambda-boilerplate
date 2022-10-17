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

  path: resolve(__dirname,'../dist'),
  handler: 'lambda.handler',
  runtime: 'nodejs16.x',
  version: 'v0.0.1',
  layerPath: resolve(__dirname,'../dist/layers'),
  isApiRequired: true,
  securityGroupIds: ["sg-07f481ec2ced54878"],
  subnetIds: ["subnet-01c22b0adf9cdd8df", "subnet-0b32fea3b2e13a6ba"]
});



app.synth();
