export interface LambdaFunctionConfig {
  path: string,
  handler: string,
  runtime: string,
  version: string,
  layerPath?: string,
  isApiRequired?: boolean
  isSqsRequired?: boolean
  isSnsTopicRequired?: boolean
}
