export interface SnsFunctionConfig {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  layerPath?: string;
  snsTopicProtocol: string;
  lambdaStatementId: string;
  lambdaAction: string;
  lambdaPrincipal: string;
  securityGroupIds?: string[];
  subnetIds?: string[];
  kmsMasterKeyId: string;
}
