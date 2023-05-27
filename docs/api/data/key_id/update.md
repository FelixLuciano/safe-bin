# Update `/data/{key_id}`

Atualiza um dado. Modifica na tabela, no índice `key_id` do parâmetro de rota, o
valor de `data` no `body`.

- Método HTTP: `PUT`

## Estrutura do `head`

```json
{
    "Authentication": string
}
```

## Estrutura do `body`

```json
{
    "data": string
}
```

- `data` - Valor que deseja-se armazenar, encriptado pela mesma chave do valor
  atual.

- `Authentication` - Cifra utilizada para autenticação, obtida em `GET /key`.

## Estrutura da resposta

### Status `200`

Dado atualizado com êxito.

```json
"No Data"
```

### Status `403`

Não autorizado.

### Status `404`

Dado não encontrado.
