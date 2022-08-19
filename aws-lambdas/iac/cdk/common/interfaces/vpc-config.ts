export interface VpcConfig{
    path: string,
    handler: string,
    runtime: string,
    version: string,
    layerPath?: string,
    securityGroupIds:string[]
    subnetIds:string[]
}
