bootstrap-lambda:
	@cd aws-lambdas/lambda && yarn install

bootstrap:
	@cd aws-lambdas/lambda && yarn install
	@cd aws-lambdas/iac/terraform && terraform init

build:
	@cd aws-lambdas/lambda && yarn build

lint:
	@cd aws-lambdas/lambda && yarn lint

test:
	@cd aws-lambdas/lambda && yarn test

clean:
	@cd aws-lambdas/lambda && yarn cleanup && rm -rf node_modules && rm -rf dist
	@cd aws-lambdas/iac/terraform && rm -rf /.terraform

make pre-commit:
	@pre-commit run -a
	@cd aws-lambdas/lambda && yarn lint:fix
