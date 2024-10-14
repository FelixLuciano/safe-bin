---
title: Implantação
hero: true
---

<VPDocHero
  class="VPDocHero"
  name="Implantação"
  text="Infraestrutura como Código"
  tagline="e gerenciamento declarativo"
  image="/image/fluentui-emoji/building-construction-3d.png"
/>

Como mencionado anteriormente, o Terraform permite criar, modificar e gerenciar
infraestruturas de forma declarativa. Isso significa que ele é uma camada de
abstração entre os recursos de um serviço na nuvem e a sua implementação. Na
prática, um provedor disponibiliza a configuração de serviços na nuvem de forma
programática, que podem ser solicitados por usuários autorizados, como
desenvolvedores. Então, o Terraform é o meio de um desenvolvedor roteirizar
estas solicitações programáticas em uma linguagem independente do provedor.

Com isso, é possível construir toda a infraestrutura do SafeBin apenas
executando alguns comandos. Como o
[`init`](https://developer.hashicorp.com/terraform/cli/commands/init) para
inicializar o diretório:

::: code-group

```sh [shell]
$ cd terraform
$ terraform init
```

:::

Com o diretório inicializado e os arquivos de estado da infraestrutura criados,
executando
[`plan`](https://developer.hashicorp.com/terraform/cli/commands/plan), é
elaborado um plano de execução com base no estado atual da infraestrutura e a
infraestrutura programada, que cria o arquivo `terraform.tfstate`:

::: code-group

```sh [shell]
$ terraform plan -out .tfplan
```

:::

Então é preciso apenas executar as ações propostas no plano e construir de fato
a infraestrutura executando
[`apply`](https://developer.hashicorp.com/terraform/cli/commands/apply):

::: code-group

```sh [shell]
$ terraform apply ".tfplan"
```

:::

Assim que o processor for concluído, será exibido, no final da saída do comando,
a URL do ambiente de produção. Algo semelhante ao seguinte:

```hcl
api_endpoint = "https://XXXXXXXXXX.execute-api.REGIAO.amazonaws.com/production"
```

Tudo pronto! Mas para entender como a aplicação de fato funciona, é preciso ir
mais fundo.

## Provedor da infraestrutura

Primeiramente, é preciso configurar o provedor da infraestrutura. Isso é feito
no arquivo
[`provider.tf`](https://github.com/FelixLuciano/safe-bin/blob/main/terraform/provider.tf).
Nele, é declarado a versão da interface, as opções do provedor, e é também
solicitara uma instancia [AWS S3](https://aws.amazon.com/s3/) para o
[backend do Terraform](https://developer.hashicorp.com/terraform/language/settings/backends/configuration).

::: code-group

```hcl [provider.tf]
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.0.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

terraform {
  backend "s3" {
    bucket  = "safe-bin"
    key     = "terraform.tsstate"
    region  = "us-east-1"
    encrypt = true
  }
}
```

:::

## Serviço de Indentidade e Gerenciamento de Acesso (IAM)

Para garantir a segurança da nuvem, os serviços são restritos e com permissões
_opt-in_. Ou seja, é preciso declarar que algo pode ser feito para poder
fazê-lo. E a declaração destas permições é realizada no arquivo
[`iam.tf`](https://github.com/FelixLuciano/safe-bin/blob/main/terraform/iam.tf),
que utiliza o [AWS IAM](https://aws.amazon.com/iam/) para gerenciar as
permissões dos serviços.

::: code-group

```hcl [iam.tf]
resource "aws_iam_role" "lambda_role" {
  name               = "lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_policy.json
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = [
      "sts:AssumeRole"
    ]
  }
}

resource "aws_iam_policy" "lambda_dynamodb_policy" {
  name = "lambda_dynamodb_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem"
        ]
        Resource = "arn:aws:dynamodb:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb_policy_attachment" {
  policy_arn = aws_iam_policy.lambda_dynamodb_policy.arn
  role       = aws_iam_role.lambda_role.name
}
```

- O recurso
  [`aws_iam_role`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role)
  `lambda_role` cria uma função que será utilizada posteriormente pelas funções
  Lambda para poderem ser invocadas e entrarem em execução;
- O dado
  [`aws_iam_policy_document`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document)
  `lambda_policy` cria a política da função `lambda_role` que permite as funções
  Lambda para poderem ser invocadas;
- O recurso
  [`aws_iam_policy`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy)
  `lambda_dynamodb_policy` cria a política de as funções Lambda autorizadas
  poderem realizar operações no bando de dados DynamoDB;
- O recurso
  [`aws_iam_role_policy_attachment`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment)
  `lambda_dynamodb_policy_attachment` anexa as políticas de
  `lambda_dynamodb_policy` na função `lambda_role`.

:::

## Serviço Amazon DynamoDB

O armazenamento dos dados do SafeBin é realizado no serviço da
[Amazon DynamoBD](https://aws.amazon.com/pt/dynamodb), por ser um banco de dados
ideal para operações simples. Tudo é feito em uma única tabela declarada no
arquivo
[`dynamodb.tf`](https://github.com/FelixLuciano/safe-bin/blob/main/terraform/dynamodb.tf).

::: code-group

```hcl [dynamodb.tf]
resource "aws_dynamodb_table" "data" {
  name         = "safebin_data"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "key_id"

  attribute {
    name = "key_id"
    type = "S"
  }
}
```

:::

A tabela no recurso
[`aws_dynamodb_table`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table)
`data` possui duas colunas do tipo `string`, uma para a chave e outra para o
valor encriptado, e ambas do tipo `string`. Por conta do valor não ser
indexável, não é necessário declará-lo.

## Cliente AWS KMS

Os dados que chegam ao SafeBin precisam estar encriptados desde o cliente, então
quando é solicitada uma requisição de modificação, a função Lambda chama o
cliente [AWS KMS](https://aws.amazon.com/kms/) para verificar de a chave cifrada
confere com o item no banco de dados. Para isso, é utilizada uma chave mestra
delcarada no arquivo
[`kms.tf`](https://github.com/FelixLuciano/safe-bin/blob/main/terraform/kms.tf).

::: code-group

```hcl [kms.tf]
resource "aws_kms_key" "master_key" {
  description = "SafeBin API Master Key"
}

resource "aws_kms_grant" "master_grant" {
  key_id            = aws_kms_key.master_key.key_id
  grantee_principal = aws_iam_role.lambda_role.arn
  operations = [
    "GenerateDataKey",
    "Decrypt"
  ]
}
```

:::

- O recurso `aws_kms_key` `master_key` cria a chave mestra no KMS;
- O recurso `aws_kms_grant` `master_grant` concede o acesso a função
  `lambda_role` aos recursos do KMS.

## Serviço AWS Lambda

O serviço [AWS Lambda](https://aws.amazon.com/lambda/) é fundamental para o
SafeBin. Ele lida com as requisições recebidas por chamas RESTful no API
Gateway, autentica requisições com o ciente KMS e realiza operações na tabela no
DynamoDB. Todas as funções das rotas estão declaradas no arquivo
[`lambda.tf`](https://github.com/FelixLuciano/safe-bin/blob/main/terraform/lambda.tf).
Por conta de ser um arquivo muito grande, este é um trecho que ilustra todos os
recursos utilizados.

::: code-group

```hcl [lambda.tf]
...

data "archive_file" "api_view_lambda_data_key_modify" {
  type        = "zip"
  source_file = "../src/data_key_modify.py"
  output_path = "../.build/lambda/data_key_modify_view.payload.zip"
}

data "archive_file" "api_lambda_layer_cryptography" {
  type        = "zip"
  source_dir  = "../.build/layer"
  output_path = "../.build/lambda/cryptography.layer.zip"

}

resource "aws_lambda_layer_version" "cryptography" {
  layer_name          = "cryptography_layer"
  filename            = data.archive_file.api_lambda_layer_cryptography.output_path
  source_code_hash    = data.archive_file.api_lambda_layer_cryptography.output_base64sha256
  compatible_runtimes = ["python3.9"]
}

resource "aws_lambda_function" "api_view_data_key_modify" {
  function_name    = "api_view_data_key_modify"
  filename         = data.archive_file.api_view_lambda_data_key_modify.output_path
  source_code_hash = data.archive_file.api_view_lambda_data_key_modify.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
  handler          = "data_key_modify.update_delete_handler"
  runtime          = "python3.9"
  timeout          = 5

  # is dynamodb client
  depends_on = [aws_dynamodb_table.data]

  environment {
    variables = {
      KMS_MASTER_KEY_ID        = aws_kms_key.master_key.key_id
      DYNAMODB_DATA_TABLE_NAME = aws_dynamodb_table.data.name
    }
  }

  layers = [aws_lambda_layer_version.cryptography.arn]
}

resource "aws_lambda_permission" "api_invoke_view_data_key_modify" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  principal     = "apigateway.amazonaws.com"
  function_name = aws_lambda_function.api_view_data_key_modify.function_name
}

...
```

:::

- O arquivo zipado
  [`archive_file`](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file)
  `api_view_lambda_data_key_modify` cria o payload do o arquivo python com a
  função chamada pela rota `PUT|DELETE /dtaa/{key_id}`.
- O arquivo zipado
  [`archive_file`](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file)
  `api_lambda_layer_cryptography` cria o payload com o diretório criado
  anteriormente dos pacotes utilizados pela função.
- O recurso
  [`aws_lambda_layer_version`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_layer_version)
  `cryptography` cria o layer para a função Lambda utilizar as bibliotecas
  python.
- O recurso
  [`aws_lambda_function`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)
  `api_view_data_key_modify` cria a função Lambda.

::: info Informação adicional

Para as funções que operam na base de dados, foi adicionada a dependência do
recurso da tabela e a variável de ambiente com o nome dela.

:::

::: info Informação adicional

Para as funções que realizam autenticação, foi adicionada a variável de ambiente
com o nome identificador da chave mestra. E foi adicionado o layer com as
bibliotecas de criptografia para o python.

Também foi necessário aumentar o timeout fa função para 5 segundos. Pois leva em
média 4 segundos para a operação ser realzada.

:::

## Serviço API Gateway

O Serviço [AWS API Gateway](https://aws.amazon.com/api-gateway/) é responsável
invocar e retornar as respostas das funções Lambda as requisições dos clientes.
Isso é feito a partir da definição de diversas rotas em uma API REST neste
serviço.

::: code-group

```hcl [api-gateway.tf]
resource "aws_api_gateway_rest_api" "api" {
  name = "safebin-api"
}

...

resource "aws_api_gateway_resource" "api_resource_data_key" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_resource.api_resource_data.id
  path_part   = "{key_id}"
}

resource "aws_api_gateway_method" "api_method_data_key_modify" {
  for_each = toset(["PUT", "DELETE"])

  rest_api_id   = aws_api_gateway_rest_api.api.id
  resource_id   = aws_api_gateway_resource.api_resource_data_key.id
  http_method   = each.value
  authorization = "NONE"

  request_parameters = {
    "method.request.path.key_id" = true
  }
}

resource "aws_api_gateway_integration" "api_view_data_key_modify" {
  for_each = toset(["PUT", "DELETE"])

  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_resource.api_resource_data_key.id
  http_method = aws_api_gateway_method.api_method_data_key_modify[each.key].http_method
  depends_on  = [aws_lambda_function.api_view_data_key_modify]

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.api_view_data_key_modify.invoke_arn
}

...

resource "aws_api_gateway_deployment" "production" {
  rest_api_id = aws_api_gateway_rest_api.api.id

  depends_on = [
    aws_api_gateway_integration.api_view_data,
    aws_api_gateway_integration.api_view_data_key_access,
    aws_api_gateway_integration.api_view_data_key_modify,
  ]
}

resource "aws_api_gateway_stage" "production" {
  rest_api_id   = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.production.id
  stage_name    = "production"
}

output "api_endpoint" {
  value = "${aws_api_gateway_deployment.production.invoke_url}${aws_api_gateway_stage.production.stage_name}"
}
```

:::

- O recurso
  [`aws_api_gateway_rest_api`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_rest_api)
  `api` cria uma API REST no API Gateway;
- O recurso `aws_api_gateway_resource` `api_resource_data_key` cria um endpoint
  na API;
- O recurso
  [`aws_api_gateway_method`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_method)
  `api_method_data_key_modify` cria um método de requisição ao endpoint;
- O recurso
  [`aws_api_gateway_integration`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration)
  `api_view_data_key_modify` cria uma integração entre o método do endpoint com
  uma função Lambda;
- O recurso
  [`aws_api_gateway_deployment`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_deployment)
  `production` Cria um _deploy_ da API REST;
- O recurso
  [`aws_api_gateway_stage`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_stage)
  `production` Publica a API REST;
- A saída `api_endpoint` Exibe no final da saída do comando `apply` a URL do
  ambiente de produção.
