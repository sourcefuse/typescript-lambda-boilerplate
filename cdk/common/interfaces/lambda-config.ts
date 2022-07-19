export interface ApiGatewayLambdaFunctionConfig {
  path: string,
  handler: string,
  runtime: string,
  version: string,
  layerPath: string
}
