---
title: Primeiros passos
hero: true
prev:
  text: 'Como funciona'
  link: '/#como-funciona'
---

<VPDocHero
    class="VPDocHero VPDocHero--medium-image"
    name="Tutorial"
    text="Como criar o seu o seu"
    tagline="E fazer o deploy na AWS"
    image="/image/fluentui-emoji/rocket.png"
    :actions="[
        {
            theme: 'alt',
            text:'Baixe os arquivos',
            link:'https://github.com/FelixLuciano/safe-bin/archive/refs/heads/main.zip'
        }, {
            theme: 'false',
            text:'OU'
        }, {
            theme: 'alt',
            text:'Clone o repositório',
            link:'https://github.com/felixLuciano/safe-bin/fork'
        }
    ]"
/>

## Requisitos mínimos

- Possuir uma conta na AWS com acesso ao console.
  [Saiba mais](https://repost.aws/knowledge-center/create-and-activate-aws-account).

## Ambiente de desenvolvimento

Antes de começar a desenvolver projetos com Infraestrutura como Código (IaC), é
necessário configurar o ambiente de desenvolvimento. Neste projeto, utilizaremos
o Terraform e o AWS-cli para gerenciar a infraestrutura na nuvem da Amazon.

### Terraform

O Terraform é uma ferramenta de código aberto desenvolvida pela Hashicorp, que
permite criar, modificar e gerenciar infraestruturas de forma declarativa. Ele
utiliza uma linguagem simples e legível chamada HashiCorp Configuration Language
(HCL) para descrever a infraestrutura desejada.

Há mais de um jeito de utilizar o terraform, seja instalando-o diretamente na
sua máquina ou através de virtualização. O jeito mais recomendado de intalá-lo é
seguir o [tutorial oficial](https://developer.hashicorp.com/terraform/downloads)
fornecido pela Hashicorp e seguir o procedimento específico para o seu sistema
operacional.

### AWS-cli

A Interface de Linha de Comando dos Serviços Web da amazon (Amazon Web Service
Command Line Interface) permite interagir com a nuvem localmente através do
terminal. Netse caso, é utilizado para fazer autenticação do usuário IAM
(Identity and Access Management) no Terraform.

A instalação do AWS-cli também pode variar de acordo com seu sistema
operacional. Então, é recomendável é seguir o
[tutorial oficial](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
fornecido pela Amazon para obter as instruções específicas.

Após a instalação do cliente, é necessário instalar as credenciais do seu
usuário. Ao executar o seguinte comando
([saber mais](https://docs.aws.amazon.com/cli/latest/reference/configure/index.html))
são solicitadas as credenciais e instaladas automaticamente:

::: windows-group

```sh [Bash]
$ aws configure
```

:::

::: tip Atenção

Configurar corretamente o ambiente de desenvolvimento é essencial para garantir
o funcionamento e a segurança ao trabalhar com Infraestrutura como Código.
Certifique-se de seguir as instruções fornecidas pelos desenvolvedores do
Terraform e da AWS-cli para uma configuração adequada em seu sistema
operacional.

:::

### Docker

Docker é uma plataforma de código aberto que permite a criação, implantação e execução de aplicativos em contêineres. Os contêineres são como máquinas virtuais leves que permitem que os desenvolvedores embalem e distribuam facilmente seus aplicativos junto com todas as dependências necessárias. Isso garante que o aplicativo funcione de forma consistente em qualquer ambiente, independentemente de diferenças entre sistemas operacionais ou configurações. O Docker será utilizado com uma container semelhante ao sistema utilizado na nuvem, para gerar o pacote de bibliotecas que utilizado pelo serviço em produção.

Existem várias maneiras de instalar o Docker, mas uma forma geral de fazê-lo é a partir do [tutorial oficial](https://www.docker.com/get-started) específico para seu sistema operacional no site oficial do Docker

Após a instalação, já é possível fazer construir este pacote. Esta etapa é realizada apenas uma vez, enquanto o arquivo do pacote estiver disponível no espaço de trabalho. Etão execute o seguinte comando:

::: windows-group

```sh [Bash]
$ docker-compose up --build
```

:::

Agora, o ambiente de desenvolvimento está completo para a criação da infraestrutura na nuvem.
