import { XOR } from 'ts-essentials';

type LambdaFunctionBaseConfig = {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  memorySize?: number;
  envVars?: {
    [x: string]: string;
  };
  layerPath?: string;
  isApiRequired?: boolean;
  invocationData?: string;
  timeout?: number;
};

export type LambdaFunctionConfig = XOR<
  LambdaFunctionBaseConfig & {
    securityGroupIds: string[];
    subnetIds: string[];
  },
  LambdaFunctionBaseConfig
>;
