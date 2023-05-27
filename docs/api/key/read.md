# Read `/key`

Retorna um par de chaves para encriptação de dados no cliente e autenticação dos
dados no servidor.
[Saiba mais](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/kms/client/generate_data_key.html).

- Método HTTP: `GET`

## Estrutura da resposta

### Status `200`

```json
{
    "cipher": string,
    "secret": string
}
```

- `cipher` - Cifra utilizada para autenticação. É a chave `secret` encriptada
  pela chave mesta no servidor.
- `secret` - Chave simétrica aleatória.
