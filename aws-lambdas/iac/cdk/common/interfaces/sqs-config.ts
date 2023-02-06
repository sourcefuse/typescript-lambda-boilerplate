export interface SqsFunctionConfig {
  path: string;
  handler: string;
  runtime: string;
  version: string;
  layerPath?: string;
  delay: number;
  maxMessageSize: number;
  batchSize: number;
  messageRetentionSeconds: number;
  receiveWaitTimeSeconds: number;
  maxReceiveCount: number;
  securityGroupIds?: string[];
  subnetIds?: string[];
  kmsMasterKeyId: string;
  kmsDataKeyReusePeriodSeconds: number;
  namespace : string;
  environment : string;
}
