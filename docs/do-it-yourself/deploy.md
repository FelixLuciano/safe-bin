---
title: Infraestrutura como Código
---

[Terraform AWS Lambda function](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)


::: windows-group

```sh [shell]
$ cd terraform
```

:::

::: windows-group

```sh [shell]
$ terraform plan -out .tfplan
```

:::

::: windows-group

```sh [shell]
$ terraform apply .tfplan
```

:::

::: windows-group

```sh [shell]
$ docker run -v .:/var/task "public.ecr.aws/sam/build-python3.9" /bin/sh -c "pip install -r requirements.txt -t python/lib/python3.9/site-packages/; exit"              
```

:::
