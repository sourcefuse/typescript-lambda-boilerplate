import * as aws from '@cdktf/provider-aws';
import { App, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import { DbModule, DbModuleOptions } from './.gen/modules/dbModule';

dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});

export class DbStack extends TerraformStack {
  constructor(scope: Construct, name: string, options: DbModuleOptions) {
    super(scope, name);

    new aws.provider.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      profile: process.env.AWS_PROFILE,
      assumeRole: [
        {
          roleArn: process.env.AWS_ROLE_ARN,
        },
      ],
    });

    const dataAwsVpcVpc = new aws.dataAwsVpc.DataAwsVpc(this, 'vpc', {
      filter: [
        {
          name: 'vpc-id',
          values: [options?.vpcId],
        },
      ],
    });

    new DbModule(this, 'aurora', {
      auroraAllowedCidrBlocks: [dataAwsVpcVpc.cidrBlock],
      ...options
    });
  }
}

const app = new App();

new DbStack(app, 'db', {
  auroraSubnets: ['subnet-01c22b0adf9cdd8df', 'subnet-0b32fea3b2e13a6ba'],
  namespace: 'arc2',
  vpcId: 'vpc-0d614535e4a3843d4',
  auroraAllowMajorVersionUpgrade: true,
  auroraAutoMinorVersionUpgrade: true,
  auroraClusterEnabled: true,
  auroraClusterName: 'aurora-examples',
  auroraClusterSize: 1,
  auroraDbAdminUsername: 'example_db_admin',
  auroraDbName: 'example',
  auroraInstanceType: 'db.serverless',
  rdsInstancePubliclyAccessible: true,
  auroraServerlessv2ScalingConfiguration: {
    max_capacity: 16,
    min_capacity: 2,
  },
  enhancedMonitoringName: 'aurora-example-enhanced-monitoring',
  environment: process.env.ENV || 'dev',
  region: process.env.AWS_REGION,
  auroraDbAdminPassword: 'password',
});

app.synth();
