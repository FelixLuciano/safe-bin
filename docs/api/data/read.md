# Read `/data`

Leitura de múltiplos dados. Retorna uma lista dos dados com base na lista de índices.

- Método HTTP: `POST`

## Estrutura do `body`

```json
{
    "keys": string[]
}
```

- `keys`: Lista de chaves com valores armazenados no servidor. As chaves que não forem encontradas, não anexarão dados na reposta.

## Estrutura da resposta

### Status `200`

```json
{
    "data": [
        {
            "key_id": string,
            "data": string
        }
    ]
}
```

- `data`: Lista dos valores encontrados com êxito no servidor.
- `key_id`: Chave do valor encontrado.
- `data`: Valor indexado pela chave.

### Status `400`

Requisição inválida.
