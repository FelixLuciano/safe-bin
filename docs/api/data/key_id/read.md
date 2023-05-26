# Read `/data/{key_id}`

Lê um dado. Procura na tabela, no índice `key_id` do parâmetro de rota, retornando o valor armazenado.

- Método HTTP: `GET`

## Estrutura da resposta

### Status `200`

Dado lido com êxito.

```json
{
    "data": string
}
```

- `data` - Valor armazenado no servidor.

### Status `404`

Dado não encontrado.
