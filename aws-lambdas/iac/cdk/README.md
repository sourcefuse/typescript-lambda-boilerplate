# CDK Module For Lambda

We can use the Cloud Development Kit for Terraform (CDKTF) to define advanced deployment configurations.

CDKTF stacks let us manage multiple Terraform configurations in the same CDKTF application. They can save us from writing repetitive CDKTF code, while allowing us to independently manage the resources in each stack. we can also use the outputs of one stack as inputs for another.

## Getting Started

1. Create a dot env file:  
  ```shell
  touch .env
  ```

3. Configure the following keys in the `.env` file:  
  * **AWS_REGION**: *aws_region*  
  * **AWS_KEY**: *aws_key*   
  * **AWS_ACCESS_KEY_ID**: *aws_access_key*
  * **AWS_SECRET_ACCESS_KEY**: *aws_secret_key*
  * **AWS_ROLE_ARN**: *role_arn*
  * **AWS_PROFILE**: *Path of the dist folder of lambda function*

  Note: if You want to use * **AWS_ACCESS_KEY_ID** and * **AWS_SECRET_ACCESS_KEY** then keep 
  * **AWS_PROFILE** as blank.

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
* To deploy the stack on aws and remember to confirm the deploy with a yes.  
  ```shell
  cdktf deploy <stack_name>
  ```
* To destroy the Infrastructure that you deployed on aws.  
  ```shell
  cdktf destroy <stack_name>
  ```
