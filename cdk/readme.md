# CDK Module For Lambda

We can use the Cloud Development Kit for Terraform (CDKTF) to define advanced deployment configurations.

CDKTF stacks let us manage multiple Terraform configurations in the same CDKTF application. They can save us from writing repetitive CDKTF code, while allowing us to independently manage the resources in each stack. we can also use the outputs of one stack as inputs for another.

## Getting Started

1. Create a dot env file:  
  ```shell
  touch .env
  ```

3. Configure the following keys in the `.env` file:  
  * **region**: *aws_region*  
  * **key**: *aws_key*   
  * **encrypt**: *true*
  * **accessKey**: *aws_access_key*
  * **secretKey**: *aws_secret_key*
  * **allowedAccountIds**: *allowed_account_ids*
  * **roleArn**: *role_arn*
  * **path**: *Path of the dist folder of lambda function*

3. Run *npm install* to install the dependency packages for cdktf. Now you are ready to go with cdktf commands.

## How to Run
This module gives us several commands for the aws lambda function.  
* To generate the random provider. This configuration uses the random provider to ensure the IAM role name is unique.  
  ```shell
  cdktf get 
  ```
* List all the stacks defined in your CDKTF application.  
  ```shell
  cdktf list
  ``` 
* To deploy the lambda stack on aws and remember to confirm the deploy with a yes.  
  ```shell
  cdktf deploy lambda
  ```
* To destroy the Infrastructure that you deployed on aws.  
  ```shell
  cdktf destroy lambda
  ```