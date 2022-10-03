export  const lambdaRolePolicy = {
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


export const lambdaPolicyArn = 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole';
export const lambdaPolicyArn = '"arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"';


export const lambdaAction = 'lambda:InvokeFunction';

export const lambdaPrincipal = 'apigateway.amazonaws.com';
