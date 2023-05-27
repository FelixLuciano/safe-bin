# Delete `/data/{key_id}`

Exclui um dado. Deleta na tabela, o índice `key_id` do parâmetro de rota e o
valor armazenado.

- Método HTTP: `DELETE`

## Estrutura do `head`

```json
{
    "Authentication": string
}
```

- `Authentication` - Cifra utilizada para autenticação, obtida em `GET /key`.

## Estrutura da resposta

### Status `200`

Dado excluido com êxito.

```json
"No Data"
```

### Status `403`

Não autorizado.

### Status `404`

Dado não encontrado.
