import {TerraformStack,AssetType, TerraformAsset, TerraformOutput} from 'cdktf';
import {Construct} from 'constructs';
import * as aws from '@cdktf/provider-aws';
import {VpcConfig} from '../interfaces';
import * as random from '../../.gen/providers/random';
import { vpcRoleArn, vpcRolePolicy } from '../constants';
export class VpcStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: VpcConfig) {
    super(scope, name);
    console.log(config.path)
    new aws.AwsProvider(this, 'aws', {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secretKey: process.env.AWS_SECRET_ACCESS_KEY,
      profile: process.env.AWS_PROFILE,
      assumeRole: {
       roleArn: process.env.AWS_ROLE_ARN,
      }
    });

    // Creating Archive of Lambda
    const asset = new TerraformAsset(this, 'lambda-asset', {
        path: config.path,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });


    new random.RandomProvider(this, 'random');

    // Create random value
    const pet = new random.Pet(this, 'random-name', {
      length: 2,
    });

      const role = new aws.iam.IamRole(this, 'vpc-exec', {
        name: `sqs-role-${name}-${pet.id}`,
        assumeRolePolicy: JSON.stringify(vpcRolePolicy),
      });
   
   
       // Add execution role for lambda to write to CloudWatch logs
      new aws.iam.IamRolePolicyAttachment(this, 'vpc-managed-policy', {
             policyArn: vpcRoleArn,
             role: role.name,
        });

    const layers = [];
    if (config.layerPath) {
      // Creating Archive of Lambda Layer
      const layerAsset = new TerraformAsset(this, 'lambda-layer-asset', {
        path: config.layerPath,
        type: AssetType.ARCHIVE, // if left empty it infers directory and file
      });
      
      // Create Lambda Layer for function
      const lambdaLayers = new aws.lambdafunction.LambdaLayerVersion(this, 'lambda-layer', {
        filename: layerAsset.path,
        layerName: `${name}-layers-${pet.id}`,
      });

      layers.push(lambdaLayers.arn);
    }
    
      // Create VPC with Typescript and CKDTF
    const newVpc = new aws.vpc.Vpc(this, "VPC", {
      cidrBlock: config.vpcCidrBlock,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-VPC`,
      },
    });

    // Create a Private subnet for assigning to the private network
    const privateSubnet = new aws.vpc.Subnet(this, "Private-Subnet", {
      availabilityZone: config.subnetAvailabilityZone,
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: false,
      cidrBlock: config.privateSubnetCidrBlock,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Private-Subnet`,
      },
    });

    // Create a Public subnet for assigning to the public network
    const publicSubnet = new aws.vpc.Subnet(this, "Public-Subnet", {
      availabilityZone: config.subnetAvailabilityZone,
      vpcId: newVpc.id,
      mapPublicIpOnLaunch: true,
      cidrBlock: config.publicSubnetCidrBlock,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Public-Subnet`,
      },
    });

    // Create Internet Gateway For communication VPC and Internet
    const internetGateway = new aws.vpc.InternetGateway(this, "Internet-Gateway", {
      vpcId: newVpc.id,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Internet-Gateway`,
      },
    });

    // Create Two different Public IPs for assigning to the public network
    const publicIp = new aws.ec2.Eip(this, "eip", {
      vpc: true,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Public-eip`,
      },
    });

    // Create Nat Gateway For communication Public and Private network
    const natGateway = new aws.vpc.NatGateway(this, "Nat-Gateway", {
      allocationId: publicIp.id,
      subnetId: publicSubnet.id,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Public-NGs`,
      },
    });

    // Create Routing Table For communication Public network with Route and Association route
    const publicRouteTable = new aws.vpc.RouteTable(this, "Public-Route-Table", {
      vpcId: newVpc.id,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Public-RT`,
      },
    });

    new aws.vpc.Route(this, "public-route", {
      destinationCidrBlock: config.publicDestinationCidrBlock,
      routeTableId: publicRouteTable.id,
      gatewayId: internetGateway.id,
    });

    new aws.vpc.RouteTableAssociation(this, "Route-Table-Association-PUB-SUB", {
      routeTableId: publicRouteTable.id,
      subnetId: publicSubnet.id,
    });

    // Create Routing Table For communication Private network with Route and Association route
    const privateRouteTable = new aws.vpc.RouteTable(this, "Private-Route-Table", {
      vpcId: newVpc.id,
      tags: {
        Name: `CDKtf-${name}-${pet.id}-Private-RT`,
      },
    });

    new aws.vpc.Route(this, "Private-Route", {
      destinationCidrBlock: config.privateDestinationCidrBlock,
      routeTableId: privateRouteTable.id,
      natGatewayId: natGateway.id,
    });

    new aws.vpc.RouteTableAssociation(this, "Route-Table-Association-Private-SUB", {
      routeTableId: privateRouteTable.id,
      subnetId: privateSubnet.id,
    });
   
    new aws.vpc.DefaultNetworkAcl(this,"default_network_acl",{
      defaultNetworkAclId: newVpc.defaultNetworkAclId,
      subnetIds: [publicSubnet.id, privateSubnet.id],
    
      ingress: [
        {
        protocol: config.aclIngressProtocol,
        ruleNo: config.aclIngressRuleNo,
        action: config.aclIngressAction,
        cidrBlock: config.aclIngressCidrBlock,
        fromPort: config.aclIngressFromPort,
        toPort: config.aclIngressToPort
      }
    ],
    
      egress: [
        {
        protocol: config.aclEgressProtocol,
        ruleNo: config.aclEgressRuleNo,
        action: config.aclEgressAction,
        cidrBlock: config.aclEgressCidrBlock,
        fromPort: config.aclEgressFromPort,
        toPort: config.aclEgressToPort
      }
    ],
    
      tags: {
        Name: `${name}-${pet.id}-default-network-acl`
      }
    });

    const defaultSecurityGroup = new aws.vpc.DefaultSecurityGroup(this,"default-security-group",{
      vpcId: newVpc.id,
      ingress: [
        {
        protocol: config.securityGroupIngressProtocol,
        fromPort: config.securityGroupIngressFromPort,
        toPort: config.securityGroupIngressToPort
      }
    ],
    
      egress:[
      {
        fromPort: config.securityGroupEgressFromPort,
        toPort: config.securityGroupEgressToPort,
        protocol: config.securityGroupEgressProtocol,
        cidrBlocks: config.securityGroupEgressCidrBlocks
      }
    ],
    
      tags: {
        Name: `${name}-${pet.id}-default-security-group`
      }
    });

   new aws.lambdafunction.LambdaFunction(this, 'lambda-function', {
      functionName: `cdktf-vpc-${name}-${pet.id}`,
      filename: asset.path,
      handler: config.handler,
      runtime: config.runtime,
      role: role.arn,
      layers,
      vpcConfig: {
        subnetIds: [privateSubnet.id],
        securityGroupIds: [defaultSecurityGroup.id]
      }
    });

    new TerraformOutput(this, "Vpc id", {
      value: newVpc.id,
    });
  }

}
