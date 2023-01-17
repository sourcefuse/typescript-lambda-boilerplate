// https://cdk.tf/testing
import { Apigatewayv2Api } from '@cdktf/provider-aws/lib/apigatewayv2-api';
import { IamPolicy } from '@cdktf/provider-aws/lib/iam-policy';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { LambdaLayerVersion } from '@cdktf/provider-aws/lib/lambda-layer-version';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { Pet } from '@cdktf/provider-random/lib/pet';
import { Testing } from 'cdktf';
import 'cdktf/lib/testing/adapters/jest'; // Load types for expect matchers
import { LambdaFunctionConfig, LambdaStack } from '../common';

expect.addSnapshotSerializer({
  test: val => typeof val === 'string',
  print: val => {
    if (typeof val === 'string') {
      const newVal = val.replace(/[A-Z0-9]{32}/g, 'ABC123');
      return `${newVal}`;
    }
    return '';
  },
});

describe('My CDKTF Application with all config set', () => {
  let config: LambdaFunctionConfig;
  let lambdaStack: LambdaStack;
  let stack: string;

  beforeEach(() => {
    config = {
      // Set up test config
      path: __dirname,
      handler: 'lambda.handler',
      runtime: 'nodejs16.x',
      version: 'v0.0.1',
      layerPath: __dirname,
      subnetIds: ['subnet-123456'],
      securityGroupIds: ['sg-123456'],
      isApiRequired: true,
    };

    const app = Testing.app();
    lambdaStack = new LambdaStack(app, 'test', config);
    stack = Testing.synth(lambdaStack);
  });

  it('should create the expected number of resources', () => {
    expect(stack).toHaveResourceWithProperties(LambdaFunction, {
      vpc_config: {
        security_group_ids: ['sg-123456'],
        subnet_ids: ['subnet-123456'],
      },
    });
    expect(stack).toHaveResource(IamRole);
    expect(stack).toHaveResource(LambdaLayerVersion);
    expect(stack).toHaveResource(IamPolicy);
    expect(stack).toHaveResource(IamRolePolicyAttachment);
    expect(stack).toHaveResource(Apigatewayv2Api);
    expect(stack).toHaveResource(LambdaPermission);
    expect(stack).toHaveResourceWithProperties(Pet, {length: 2});
  });

  it('should match snapshot test', () => {
    expect(stack).toMatchSnapshot();
  });

  it('check if the produced terraform configuration is valid', () => {
    expect(Testing.fullSynth(lambdaStack)).toBeValidTerraform();
  });

  it('check if the produced terraform configuration is planing successfully', () => {
    expect(Testing.fullSynth(lambdaStack)).toPlanSuccessfully();
  });
});

describe('My CDKTF Application with config change', () => {
  it('should not create vpc if subnetIds and securityGroupIds are not provided', () => {
    const config = {
      path: __dirname,
      handler: 'lambda.handler',
      runtime: 'nodejs16.x',
      version: 'v0.0.1',
      layerPath: __dirname,
      isApiRequired: true,
    };
    const app = Testing.app();
    const lambdaStack = new LambdaStack(app, 'test', config);
    const stack = Testing.synth(lambdaStack);
    expect(stack).toHaveResource(LambdaFunction);
    expect(stack).not.toHaveResourceWithProperties(LambdaFunction, {
      vpc_config: {
        security_group_ids: ['sg-123456'],
        subnet_ids: ['subnet-123456'],
      },
    });
    expect(stack).toHaveResource(IamRole);
    expect(stack).toHaveResource(LambdaLayerVersion);
    expect(stack).toHaveResource(IamPolicy);
    expect(stack).toHaveResource(IamRolePolicyAttachment);
    expect(stack).toHaveResource(Apigatewayv2Api);
    expect(stack).toHaveResource(LambdaPermission);
    expect(stack).toHaveResourceWithProperties(Pet, {length: 2});
  });

  it('should not create api gateway if isApiRequired is false', () => {
    const config = {
      path: __dirname,
      handler: 'lambda.handler',
      runtime: 'nodejs16.x',
      version: 'v0.0.1',
      layerPath: __dirname,
      subnetIds: ['subnet-123456'],
      securityGroupIds: ['sg-123456'],
      isApiRequired: false,
    };
    const app = Testing.app();
    const lambdaStack = new LambdaStack(app, 'test', config);
    const stack = Testing.synth(lambdaStack);
    expect(stack).toHaveResource(LambdaFunction);
    expect(stack).toHaveResource(IamRole);
    expect(stack).toHaveResource(LambdaLayerVersion);
    expect(stack).toHaveResource(IamPolicy);
    expect(stack).toHaveResource(IamRolePolicyAttachment);
    expect(stack).not.toHaveResource(Apigatewayv2Api);
    expect(stack).not.toHaveResource(LambdaPermission);
    expect(stack).toHaveResourceWithProperties(Pet, {length: 2});
  });

  it('should not create lambda layer if layer path is not set', () => {
    const config = {
      path: __dirname,
      handler: 'lambda.handler',
      runtime: 'nodejs16.x',
      version: 'v0.0.1',
      subnetIds: ['subnet-123456'],
      securityGroupIds: ['sg-123456'],
      isApiRequired: true,
    };
    const app = Testing.app();
    const lambdaStack = new LambdaStack(app, 'test', config);
    const stack = Testing.synth(lambdaStack);
    expect(stack).toHaveResource(LambdaFunction);
    expect(stack).toHaveResource(IamRole);
    expect(stack).not.toHaveResource(LambdaLayerVersion);
    expect(stack).toHaveResource(IamPolicy);
    expect(stack).toHaveResource(IamRolePolicyAttachment);
    expect(stack).toHaveResource(Apigatewayv2Api);
    expect(stack).toHaveResource(LambdaPermission);
    expect(stack).toHaveResourceWithProperties(Pet, {length: 2});
  });
});