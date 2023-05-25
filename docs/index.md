---
title: Início
layout: home-doc
sidebar: false
aside: false

hero:
  name: SafeBin
  text: Armazenamento encriptado e não relacional
  tagline: em um aplicativo gerenciador de senhas
  image:
    src: /image/fluentui-emoji/wastebasket-shield-3d-merged.png
    alt: SafeBin

  actions:
    - theme: brand
      text: Abrir aplicativo
      link: /app/
    - theme: alt
      text: Como funciona
      link: "#como-funciona"
    - theme: alt
      text: Crie o seu
      link: /do-it-yourself/getting-started

features:
  - icon:
      src: /image/fluentui-emoji/magnifyingglass-tilted-left-3d.png
      alt: Lente de almento inclinada para a esquerda
    title: Armazenamento aberto
    details: Se você souber os endereços certos, pode acessar todos os dados da base. Porém, se não tiver as chaves necessárias, não será capaz de ler nada, como se estivesse trancado para você.
  - icon:
      src: /image/fluentui-emoji/unlocked-3d.png
      alt: Cadeado destrancado
    title: Nada de senhas
    details: Você pode ler e escrever dados à vontade, sem precisar de senha. Mas se quiser modificar ou apagar alguma coisa, vai precisar da chave que criou aquela informação.
  - icon:
      src: /image/fluentui-emoji/linked-paperclips-3d.png
      alt: Clips de papel entrelaçados
    title: Dados não relacionados
    details: Para utilizar o serviço, é necessário registrar sua chave pública. Mas, relaxa, ninguém consegue associar os dados diretamente a você, a não ser que conheçam a lógica específica de como tudo foi organizado.

next:
  text: 'Crie o seu'
  link: '/do-it-yourself/getting-started'
---

## Como funciona

É uma aplicação em núvem que provê o armazenamento seguro de dados
criptografados. Através da AWS, é implementado uma API RESTful com os serviços
API Gateway e Lambda que processa os dados já criptografados pelo cliente e armazena em uma

<ImgZoom src="/image/aws-diagram.png" alt="Diagrama de serviços da Amazon">
    Diagrama de serviços da Amazon
</ImgZoom>
