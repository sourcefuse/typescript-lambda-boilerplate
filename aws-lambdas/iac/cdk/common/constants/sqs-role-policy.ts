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

export const delay = 90

export const maxMessageSize = 2048

export const batchSize = 10

export const messageRetentionSeconds = 86400

export const receiveWaitTimeSeconds = 10

export const redriveMaxCount = 5