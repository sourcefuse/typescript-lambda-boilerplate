import { XOR } from 'ts-essentials';

type LambdaFunctionBaseConfig = {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  layerPath?: string;
  isApiRequired?: boolean;
};

export type LambdaFunctionConfig = XOR<
  LambdaFunctionBaseConfig & {
    securityGroupIds: string[];
    subnetIds: string[];
  },
  LambdaFunctionBaseConfig
>;
