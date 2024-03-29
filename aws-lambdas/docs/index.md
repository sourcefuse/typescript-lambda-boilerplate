# Typescript Lambda Boilerplate

| :exclamation: **Contributors:** See [Development](#dev)  |  
|----------------------------------------------------------|

## <a id="prereqs"></a> Pre-Requisites
- [node.js](https://nodejs.dev/download/)
- [npm](https://docs.npmjs.com/cli/v6/commands/npm-install)
- [terraform](https://learn.hashicorp.com/terraform/getting-started/install#installing-terraform)
- [terraform-docs](https://github.com/segmentio/terraform-docs)
- [pre-commit](https://pre-commit.com/#install)

## <a id="getting_started"></a> Getting Started
This assumes you have the [pre-requisites](#prereqs) already configured, an AWS Profile configured, and a KMS Key admin role.  
For more information on how to configure an AWS Profile on your workstation, please see [Adding a profile by editing the shared AWS credentials file
](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/keys-profiles-credentials.html#adding-a-profile-to-the-aws-credentials-profile-file).

1. Install Lambda packages:
   ```shell
   make bootstrap-lambda
   ```
4. Build the Lambda:
   ```shell
   make build
   ```

## Terraform
Once you have completed the steps in [Getting Started](#getting_started), you will need to configure
the `terraform` dependencies.

:warning: This does not have a backend configured. See [Backend configuration](#backend_config) for more information.

1. Navigate to `api-gw-lambda/terraform`:
   ```shell
   
   cd aws-lambdas/terraform

   ```
2. Set your AWS Profile environment variable:
   ```shell
   export AWS_PROFILE=<profile_name>
   ```
3. Configure your local `tfvars` file.
   <details open="true">
   <summary>example.tfvars</summary>

   ```shell
   profile = "<profile_name>"
   kms_key_admin_arns = [
     "arn:aws:iam::<account_id>:role/<kms_admin_role_name>"
   ]
   ```

   </details>

   This file should include:
  * The `profile` variable override
  * The `kms_key_admin_arns` variable override. This is for additional IAM roles to map to the KMS key policy for administering the KMS key used for SSE.
4. Initialize:
   ```shell
   terraform init
   ```
5. Plan:
   ```shell
   terraform plan
   ```
6. If the plan looks good, run apply:
   ```shell
   terraform apply
   ```

### <a id="backend_config"></a> Backend configuration
Since the code contained in this repo is only intended to serve as a boilerplate, the [local](https://www.terraform.io/language/settings/backends/local) backend is being used.
* The `local` backend keeps the state local. These files are ignored in the repo's [.gitignore](.gitignore). **DO NOT**
  remove the state files from the [.gitignore](.gitignore) since the state file may contain sensitive values.

For more information on backends, see the [Terraform docs](https://www.terraform.io/language/settings/backends/configuration) list of available backends.

## <a id="dev"></a> Development
[Quality Control](#qc) **MUST** be configured prior to making any commits.

Preferred workstation setup can be found in [Confluence](https://sourcefuse.atlassian.net/wiki/spaces/SOURCEFUSE/pages/3311075411/Dev+Machine+Setup).

### <a id="qc"></a> Quality Control
This repo leverages Pre-Commit to ensure code quality and standardization.

To get started, install pre-commit:
```shell
pip install pre-commit
``` 

Once pre-commit is installed, run `pre-commit install` from the root of this repo. This executes
prior to commits to the repo.  
