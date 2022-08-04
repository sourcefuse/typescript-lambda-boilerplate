export interface SqsFunctionConfig {
    path: string,
    handler: string,
    runtime: string,
    version: string,
    layerPath?: string,
  }
  