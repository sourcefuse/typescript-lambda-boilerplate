import * as aws from "@cdktf/provider-aws";
import { Fn, TerraformIterator, TerraformOutput, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import * as random from "../../.gen/providers/random";
import { AwsProvider } from "../constructs/awsProvider";
import { Lambda } from "../constructs/lambda";
import { LambdaFunctionBaseConfig } from "../interfaces";

interface LambdaFunctionConfig extends LambdaFunctionBaseConfig {
  namespace: string;
  environment: string;
}

export class ElasticacheStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name);

    new AwsProvider(this, "aws"); // NOSONAR

    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const dataAwsVpcVpc = new aws.dataAwsVpc.DataAwsVpc(this, "vpc", {
      filter: [
        {
          name: "tag:Name",
          values: [`${config.namespace}-${config.environment}-vpc`],
        },
      ],
    });

    const dataAwsSubnetsPrivate = new aws.dataAwsSubnets.DataAwsSubnets(
      this,
      "private",
      {
        filter: [
          {
            name: "tag:Name",
            values: [
              `${config.namespace}-${config.environment}-privatesubnet-private-${process.env.AWS_REGION}a`,
              `${config.namespace}-${config.environment}-privatesubnet-private-${process.env.AWS_REGION}b`,
            ],
          },
          {
            name: "vpc-id",
            values: [dataAwsVpcVpc.id],
          },
        ],
      }
    );

    const subnetsIterator = TerraformIterator.fromList(
      Fn.toset(dataAwsSubnetsPrivate.ids)
    );

    const dataAwsSubnetSubnet =
     new aws.dataAwsSubnet.DataAwsSubnet(
      this,
      "subnet",
      {
        forEach: subnetsIterator,
        id: subnetsIterator.value,
      }
    );

    const dataAwsSecurityGroupsRedisUserSg =
      new aws.dataAwsSecurityGroups.DataAwsSecurityGroups(
        this,
        "redis_user_sg",
        {
          filter: [
            {
              name: "tag:redis-user",
              values: ["yes"],
            },
            {
              name: "vpc-id",
              values: [dataAwsVpcVpc.id],
            },
          ],
        }
      );

    const lambdaFunc = new Lambda(this, "lambda", { ...config, name: pet.id });

    const vpcConfig = {
      security_group_ids: dataAwsSecurityGroupsRedisUserSg.ids,
      subnet_ids: `\${[for s in data.${dataAwsSubnetSubnet.terraformResourceType}.${dataAwsSubnetSubnet.friendlyUniqueId} : s.id]}`,
    };

    lambdaFunc.lambda.addOverride("vpc_config", vpcConfig);

    new TerraformOutput(this, "function", {// NOSONAR
      value: lambdaFunc.arn,
    });
  }
}
