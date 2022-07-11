# Terraform: Lambda Boilerplate

## Pre-Requisites 
* You should compile you lambda first and output the `dist` to the module's folder.  
* The `Makefile` in the root of this repo will install dependencies and create the dist folder correctly:  
  ```shell
  make 
  make bootstrap
  make build
  ```

Once `make build` has been run, you can execute plan and apply.  
