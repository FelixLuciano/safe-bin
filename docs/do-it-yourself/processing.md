---
title: Proessamento
hero: true
next:
  text: API RESTful
  link: /api/
---

<VPDocHero
  class="VPDocHero"
  name="Proessamento"
  text="Lógica de negócio"
  tagline="e codigo fonte"
  image="/image/fluentui-emoji/brain-3d.png"
/>

## Fornecimento de chaves para o cliente

Para a lógica do fornecimento de chaves de dados para os clientes, em
[`keys.py`](https://github.com/FelixLuciano/safe-bin/blob/main/src/keys.py), é
feita utilizado o método
[`generate_data_key()`](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/kms/client/generate_data_key.html)
do cliente
[AWS KMS](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/kms.html)
do AWS SDK para python
[boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html#installation).

::: windows-group

```py:line-numbers {2-7} [keys.py]
def read_handler(event, context):
    kms = boto3.client("kms")

    response = kms.generate_data_key(
        KeyId=os.environ["KMS_MASTER_KEY_ID"],
        KeySpec="AES_256"
    )

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
        },
        "body": json.dumps({
            "cipher": base64.b64encode(response["CiphertextBlob"]).decode(),
            "secret": base64.b64encode(response["Plaintext"]).decode(),
        })
    }
```

:::

## Acesso aleatório aos dados armazenados

O acesso aos dados, em
[`data_key_access.py`](https://github.com/FelixLuciano/safe-bin/blob/main/src/data_key_access.py),
é relacionado com a leitura e escrita de valores no banco de dados, é
feita utilizado o serviço
[Amazon DynamoDB](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/dynamodb.html).

::: windows-group

```py:line-numbers {10-11,17,49-54} [data_key_access.py]
def create_read_handler(event, context):
    if not "key_id" in event["pathParameters"]:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.environ["DYNAMODB_DATA_TABLE_NAME"])

    key_id = event["pathParameters"]["key_id"]
    method = event["httpMethod"]

    response = None
    response = table.get_item(Key={"key_id": key_id})
    item_found = "Item" in response

    if method == "GET":
        if not item_found:
            return {
                "statusCode": 404,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                },
            }

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"data": response["Item"]["bin"]}),
        }

    body = json.loads(event["body"])

    if method == "POST":
        if item_found:
            return {
                "statusCode": 400,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                },
            }

        table.put_item(
            Item={
                "key_id": key_id,
                "bin": body["data"],
            }
        )

        return {
            "statusCode": 201,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }
```

:::

## Modificação dos dados armazenados

A modificação aos dados, em
[`data_key_modify.py`](https://github.com/FelixLuciano/safe-bin/blob/main/src/data_key_modify.py),
é relacionado com a atualização e remoção de valores no banco de dados, é
feita utilizado o serviço Amazon DynamoDB e o cliente KMS.

É utilizado também uma modificação do código [`crypto.py`](https://gist.github.com/tcitry/df5ee377ad112d7637fe7b9211e6bc83) do usuário do GitHub [@tcitry](https://github.com/tcitry) para fazer a encriptação e decriptação AES-256 ECB utilizando a biblioteca [cryptography](https://cryptography.io).

::: windows-group

```py:line-numbers {10-12,20,40-43,45,49,62-66,68} [data_key_modify.py]
def update_delete_handler(event, context):
    if not "key_id" in event["pathParameters"]:
        return {
            "statusCode": 400,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    kms = boto3.client("kms")
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(os.environ["DYNAMODB_DATA_TABLE_NAME"])

    key_id = event["pathParameters"]["key_id"]
    method = event["httpMethod"]
    headers = event["headers"]
    body = json.loads(event["body"])

    response = None
    response = table.get_item(Key={"key_id": key_id})

    if "Item" not in response:
        return {
            "statusCode": 404,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }
    elif headers is None or "Authorization" not in headers:
        return {
            "statusCode": 403,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    data = response["Item"]["bin"]

    try:
        kms_response = kms.decrypt(
            KeyId=os.environ["KMS_MASTER_KEY_ID"],
            CiphertextBlob=force_bytes(headers["Authorization"]),
        )

        verify_data = AES_256_ECB(kms_response["Plaintext"]).verify(data)
        if not verify_data:
            raise Exception()

        if method == "PUT" and not AES_256_ECB(kms_response["Plaintext"]).verify(
            body["data"]
        ):
            raise Exception()
    except Exception:
        return {
            "statusCode": 403,
            "headers": {
                "Access-Control-Allow-Origin": "*",
            },
        }

    if method == "PUT":
        table.update_item(
            Key={"key_id": key_id},
            UpdateExpression="SET bin = :val1",
            ExpressionAttributeValues={":val1": body["data"]},
        )
    elif method == "DELETE":
        table.delete_item(Key={"key_id": key_id})

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",
        },
    }
```

:::

1. Na linha 20, é feita a consulta do índice na base de dados;
2. Da linha 40 à 43 é feita a decriptação da chave sifrada, obtendo a chave secreta;
3. Na linha 45 é feita a verificação da chave secreta com o valor armazenado;
4. Na linha 49 é feita a verificação da autenticicade da requisição;
5. Da linha 62 à 66 é feita a atualização do valor na base de dados;
6. Na linha 68 é feita a aremoção do valor da base de dados.
