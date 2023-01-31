import * as aws from "@cdktf/provider-aws";
import { TerraformStack } from "cdktf";
import { Construct } from "constructs";
import * as random from "../../.gen/providers/random";
import { AwsProvider } from "../constructs/awsProvider";
import { Lambda } from "../constructs/lambda";
import { LambdaFunctionBaseConfig } from "../interfaces";

interface CronLambda extends LambdaFunctionBaseConfig {
  scheduleExpression: string;
}
export class CronModule extends TerraformStack {
  constructor(scope: Construct, id: string, config: CronLambda) {
    super(scope, id);

    new AwsProvider(this, "aws"); // NOSONAR

    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const lambda = new Lambda(this, "lambda", { ...config, name: pet.id });

    const awsCloudwatchEventRuleLambdaCron =
      new aws.cloudwatchEventRule.CloudwatchEventRule(this, "lambda_cron", {
        name: `${pet.id}-my-cron`,
        scheduleExpression: config.scheduleExpression,
      });

    new aws.cloudwatchEventTarget.CloudwatchEventTarget(this, "invoke_lambda", {// NOSONAR
      arn: lambda.arn,
      rule: awsCloudwatchEventRuleLambdaCron.name,
    });

    new aws.lambdaPermission.LambdaPermission( // NOSONAR
      this,
      "allow_cloudwatch_to_invoke",
      {
        action: "lambda:InvokeFunction",
        functionName: lambda.functionName,
        principal: "events.amazonaws.com",
        sourceArn: awsCloudwatchEventRuleLambdaCron.arn,
        statementId: "CloudWatchInvoke",
      }
    );
  }
}
