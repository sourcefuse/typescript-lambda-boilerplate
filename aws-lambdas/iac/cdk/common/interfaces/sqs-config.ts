export interface SqsFunctionConfig {
    path: string,
    handler: string,
    runtime: string,
    version: string,
    layerPath?: string,
    delay: number,
    maxMessageSize: number,
    batchSize: number,
    messageRetentionSeconds: number,
    receiveWaitTimeSeconds: number,
    redriveMaxCount: number
  }
