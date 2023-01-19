export interface LambdaFunctionConfig {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  layerPath?: string;
  isApiRequired?: boolean;
  securityGroupIds?: string[];
  subnetIds?: string[];
}
