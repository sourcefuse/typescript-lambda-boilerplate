import * as aws from "@cdktf/provider-aws";
import {
  TerraformOutput,
  TerraformStack
} from "cdktf";
import { Construct } from "constructs";
import * as random from "../../.gen/providers/random";
import {
  lambdaAction,
  lambdaPrincipal
} from "../constants";
import { AwsProvider } from "../constructs/awsProvider";
import { Lambda } from "../constructs/lambda";
import { LambdaFunctionBaseConfig } from "../interfaces";

interface LambdaFunctionConfig extends LambdaFunctionBaseConfig {
  isApiRequired?:boolean;
}
export class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: LambdaFunctionConfig) {
    super(scope, name);

    new AwsProvider(this, "aws"); // NOSONAR

    new random.provider.RandomProvider(this, "random"); // NOSONAR

    // Create random value
    const pet = new random.pet.Pet(this, "random-name", {
      length: 2,
    });

    const lambdaFunc = new Lambda(this, "lambda", {...config,name:pet.id});

    if (config.isApiRequired) {
      // Create and configure API gateway
      const api = new aws.apigatewayv2Api.Apigatewayv2Api(this, "api-gw", {
        name,
        protocolType: "HTTP",
        target: lambdaFunc.arn,
      });

      new aws.lambdaPermission.LambdaPermission(// NOSONAR
        this,
        "apigw-lambda-permission",
        {
          functionName: lambdaFunc.functionName,
          action: lambdaAction,
          principal: lambdaPrincipal,
          sourceArn: `${api.executionArn}/*/*`,
        }
      );

      new TerraformOutput(this, "url", {// NOSONAR
        value: api.apiEndpoint,
      });
    }

    new TerraformOutput(this, "function", {// NOSONAR
      value: lambdaFunc.arn,
    });
  }
}
