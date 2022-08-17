export const vpcRolePolicy = {
    'Version': '2012-10-17',
    'Statement': [
      {
        'Action': 'sts:AssumeRole',
        'Principal': {
          'Service': 'lambda.amazonaws.com',
        },
        'Effect': 'Allow',
        'Sid': '',
      },
    ],
  };
  
  
  export const vpcRoleArn = 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'
  
