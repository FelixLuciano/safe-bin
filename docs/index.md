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

SafeBin é uma Infraestrutura de armazenamento, em que uma API RESTful realiza
operações em um banco de dados do tipo chave-valor. Além disso, está atrelada a
infraestrutura um esquema de criptografia por chaves simétricas que gera chaves
para os usuários e realiza a autorização de modificações no banco de dados. E
este é um serviço agnóstica de finalidade, diversos usuários podem fazer usos
dela. Tudo com segurança e praticidade. Então, como prova de conceito, foi
implementado um gerenciador de senhas utilizando este serviço.

Primeiramente, os clientes requisitam ao serviço que envie um par de chaves para
a encriptação dos dados que serão armazenados futuramente. Este par de chaves é
composto por um segredo que o cliente utilizará para encriptar seus dados, e uma
cifra que consiste na própria no próprio segredo que foi encriptado pela chave
mestra do servidor. Isso permite que o cliente envie dados que podem ter a
autoria verificada pelo servidor de maneira segura, expondo a chave secreta
apenas na primeira solicitação.

Após obter as chaves, o cliente pode fazer escritas no banco de dados, basta um
índice único e o dado encriptado com a chave secreta, ficando a critério do
cliente definir o índice. Leituras e escritas acontecem de modo irrestrito, ou
seja, qualquer cliente pode ler e escrever qualquer item da base de dados,
contanto que tenha um índice existente ou que este esteja disponível,
respectivamente. Então, os dados são armazenados e retornados encriptados, do
modo como foram enviados.

Já, para realizar a modificação dos dados existentes, é preciso fazer a
autenticação da solicitação. Para isso, é enviado junto dela, a chave cifrada
que foi obtida inicialmente. O servidor será capaz de utilizá-la para obter a
chave secreta utilizada pelo cliente, e assim verificar os dados na solicitação
e no item solicitado. Caso seja feita a validação, a operação é autorizada e o
item é atualizado ou deletado da base de dados.

<ImgZoom src="/image/aws-diagram.png" alt="Diagrama de serviços da Amazon">
    Diagrama de serviços da Amazon
</ImgZoom>

Este projeto é uma Infraestrutura como Código (IaC) baseado nos serviços da AWS
que utiliza a plataforma do Terraform para fazer a construção da infraestrutura
de modo automatizado. A infraestrutura utiliza dos seguintes serviços: Métodos
do AWS API Gateway para fazer a invocação de funções AWS Lambda; que por sua
vez, utiliza o cliente AWS KMS para fazer o fornecimento de chaves aos clientes
e autenticação das solicitações e utiliza o serviço DynamoDB para fazer o
armazenamento dos dados criptografados.

Há mais detalhes da infraestrutura no guia de implementação do serviço.
