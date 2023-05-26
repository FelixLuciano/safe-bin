# Create `/data/{key_id}`

Cria um dado. Escreve na tabela, no índice `key_id` do parâmetro de rota, o valor de `data` no `body`.

- Método HTTP: `POST`

## Estrutura do `body`

```json
{
    "data": string
}
```

- `data` - Valor encriptado que deseja-se armazenar.

::: danger Aviso

Caso o valor não esteja encriptado, não será possível autenticação. [Saiba mais](#).

:::

## Estrutura da resposta

### Status `201`

Dado criado com êxito.

```json
"No Data"
```

### Status `400`

Dado já existe.
