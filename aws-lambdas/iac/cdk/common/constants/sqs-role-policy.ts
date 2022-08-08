export const sqsRolePolicy = {
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


export const sqsRoleArn = 'arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole'
