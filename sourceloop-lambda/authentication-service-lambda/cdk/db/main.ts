import * as aws from '@cdktf/provider-aws';
import {App, TerraformStack} from 'cdktf';
import {Construct} from 'constructs';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import {DbModule} from './.gen/modules/dbModule';

dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});

interface Config {
  vpcId: string;
  namespace: string;
  subnetIds: string[];
}

export class DbStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: Config) {
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
          values: [config.vpcId],
        },
      ],
    });

    new DbModule(this, 'aurora', {
      auroraAllowMajorVersionUpgrade: true,
      auroraAllowedCidrBlocks: [dataAwsVpcVpc.cidrBlock],
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
      auroraSubnets: config.subnetIds,
      enhancedMonitoringName: 'aurora-example-enhanced-monitoring',
      environment: process.env.ENV || 'dev',
      namespace: config.namespace,
      region: process.env.AWS_REGION,
      vpcId: dataAwsVpcVpc.id,
      // todo
      auroraDbAdminPassword: 'password',
    });
  }
}

const app = new App();

new DbStack(app, 'db', {
  subnetIds: ['subnet-01c22b0adf9cdd8df', 'subnet-0b32fea3b2e13a6ba'],
  namespace: 'arc2',
  vpcId: 'vpc-0d614535e4a3843d4',
});

app.synth();
