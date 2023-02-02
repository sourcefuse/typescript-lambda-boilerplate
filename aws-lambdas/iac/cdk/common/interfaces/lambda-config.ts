export interface LambdaFunctionBaseConfig {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  layerPath?: string;
  securityGroupIds?: string[];
  subnetIds?: string[];
  envVars?: {
    [x: string]: string;
  };
}
