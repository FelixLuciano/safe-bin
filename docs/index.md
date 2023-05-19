---
title: Início
layout: home-doc
sidebar: false

hero:
  name: SafeBin
  text: Armazenamento encriptado e não indexado
  tagline: em um aplicativo de gerenciador de senhas
  image:
    src: /image/fluentui-emoji/wastebasket-shield-3d-merged.png
    alt: VitePress

  actions:
    - theme: brand
      text: Abrir aplicativo
      link: /app/
    - theme: alt
      text: Como funciona
      link: "#como-funciona"
    - theme: alt
      text: Crie o seu
      link: /deploy/

features:
  - icon: 📑
    title: Público e não indexado
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - icon: 📖
    title: Autenticação sem senhas
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - icon: 🥰
    title: 
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

## Como funciona

A proposta do projeto visa o desenvolvimento de um gerenciador de senha que
permita aos usuários armazenar localmente o índice de suas senhas por meio de um
cliente front-end com ferramentas básicas. A interface visual desenvolvida
deverá possibilitar a busca por senhas armazenadas no servidor por meio de uma
API RESTful, mantendo o anonimato do usuário e a segurança dos dados por meio da
criptografia. O servidor não terá conhecimento de informações relacionadas às
senhas, tais como sua propriedade ou aplicação, e todo o processo de
armazenamento e recuperação de senhas será criptografado. Somente o cliente terá
a capacidade de atribuir significado à chave armazenada, garantindo a mínima
segurança e privacidade dos dados do usuário.

```sh
echo "Hello World!"
```