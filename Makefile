bootstrap-lambda:
	@cd api-gw-lambda/lambda && yarn install

bootstrap:
	@cd api-gw-lambda/lambda && yarn install
	@cd api-gw-lambda/terraform && terraform init

build:
	@cd api-gw-lambda/lambda && yarn build

lint:
	@cd api-gw-lambda/lambda && yarn lint

test:
	@cd api-gw-lambda/lambda && yarn test

clean:
	@cd api-gw-lambda/lambda && yarn cleanup && rm -rf node_modules && rm -rf dist
	@cd api-gw-lambda/terraform && rm -rf /.terraform

make pre-commit:
	@pre-commit run -a
	@cd api-gw-lambda/lambda && yarn lint:fix
