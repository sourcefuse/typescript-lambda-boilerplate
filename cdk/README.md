**CDK Module For Lambda**

We can use the Cloud Development Kit for Terraform (CDKTF) to define advanced deployment configurations.

CDKTF stacks let us manage multiple Terraform configurations in the same CDKTF application. They can save us from writing repetitive CDKTF code, while allowing us to independently manage the resources in each stack. we can also use the outputs of one stack as inputs for another.

*Getting Started:*

1. Create a dot env file.

2. Configure these  keys in dot env
    *region = "Aws region"*
    *key  = "Your own key"* 
    *bucketname = "bucket name"*
    *bucketprefix = "bucket prefix"*
    *apigateway = true or false*
    *accessKey = "Your access key"*
    *secretKey = "Your secret key"*
    *allowedAccountIds = "Your role account id"*
    *roleArn = "Your role arn"*
    *path = "Path of the dist folder of lambda function"*

    Note : If you want to use already created bucket then you have to provide it in a *bucketname* Otherwise leave *bucketname* as blank , the code will automatically create a new unique bucket for you  in S3.

            e.g. : *bucketname = ""*

    Note : If you also want to configure apigateway then in dot env file keep apigateway as true otherwise false.        

3. Run *npm install* to install the dependency packages for cdktf. Now you are ready to go with cdktf commands.


*How to Run:*

1. This module gives us several commands for the aws lambda function.

 -> *cdktf get* : To generate the random provider. This configuration uses the random         provider to ensure the IAM role name is unique.

 -> *cdktf list* : List all the stacks defined in your CDKTF application. 

 -> *cdktf deploy lambda* : To deploy the lambda stack on aws and remember to confirm the deploy with a yes.

 -> *cdktf destroy lambda* : To destroy the Infrastructure that you deployed on aws.









