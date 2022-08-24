export const snsRolePolicy = {
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
  
  
  export const snsRoleArn = "arn:aws:iam::757583164619:policy/lambda-boilerplate-vpc-sns-execution-role"
  
