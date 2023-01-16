bootstrap-lambda:
	@cd aws-lambdas/lambda && npm install

bootstrap:
	@cd aws-lambdas/lambda && npm install
	@cd aws-lambdas/iac/terraform && terraform init

build:
	@cd aws-lambdas/lambda && npm build

lint:
	@cd aws-lambdas/lambda && npm lint

test:
	@cd aws-lambdas/lambda && npm test

clean:
	@cd aws-lambdas/lambda && npm cleanup && rm -rf node_modules && rm -rf dist
	@cd aws-lambdas/iac/terraform && rm -rf /.terraform

make pre-commit:
	@pre-commit run -a
	@cd aws-lambdas/lambda && npm lint:fix
