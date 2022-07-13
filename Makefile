bootstrap-lambda:
	@cd lambda && yarn install

bootstrap:
	@cd lambda && yarn install
	@cd terraform && terraform init

build:
	@cd lambda && yarn build

lint:
	@cd lambda && yarn lint

test:
	@cd lambda && yarn test

clean:
	@cd lambda && yarn cleanup && rm -rf node_modules && rm -rf dist
	@cd terraform && rm -rf /.terraform

make pre-commit:
	@pre-commit run -a
	@cd lambda && yarn lint:fix
