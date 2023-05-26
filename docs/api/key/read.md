# Read `/key`

Retorna um par de chaves para encriptação de dados no cliente e autenticação dos
dados no servidor.

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
  pela chave mesta no servidor. [Saiba mais](#).
- `secret` - Chave simétrica aleatória. [Saiba mais](#).
