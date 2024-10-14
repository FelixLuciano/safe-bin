import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/safe-bin/",

  title: "SafeBin",
  logo: "/image/fluentui-emoji/wastebasket-shield-3d-merged.png",

  description: "Como criar o seu gerenciador de senhas não indexado com Amazon Web Services",

  head: [
    ['link', { rel: 'icon', href: "/safe-bin/image/fluentui-emoji/wastebasket-shield-3d-merged.png" }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'App',
        link: '/app/',
        activeMatch: '/app/'
      }, 
      {
        text: 'API',
        link: '/api/',
        activeMatch: '/api/'
      }, {
        text: 'Sobre',
        link: '/sobre'
      },
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "Pesquisar",
                buttonAriaLabel: "Pesquisar"
              },
              modal: {
                displayDetails: "Exibição detalhada",
                resetButtonTitle: "Limpar pesquisa",
                noResultsText: "Não há resultados para",
                backButtonTitle: "Voltar",
                footer: {
                  closeText: "Fechar",
                  navigateText: "Navegação",
                  selectText: "Selecionar",
                }
              }
            }
          }
        }
      }
    },

    sidebar: {
      '/api/': [
        {
          text: 'Documentação',
          items: [
            {
              text: 'Início',
              link: '/api/'
            }, {
              text: '/key',
              collapsed: true,
              items: [
                {
                  text: 'Read',
                  link: '/api/key/read'
                },
              ]
            }, {
              text: '/data',
              collapsed: true,
              items: [
                {
                  text: 'Read',
                  link: '/api/data/read'
                },
              ]
            }, {
              text: '/data/{key_id}',
              collapsed: true,
              items: [
                {
                  text: 'Create',
                  link: '/api/data/key_id/create'
                }, {
                  text: 'Read',
                  link: '/api/data/key_id/read'
                }, {
                  text: 'Update',
                  link: '/api/data/key_id/update'
                }, {
                  text: 'Delete',
                  link: '/api/data/key_id/delete'
                },
              ]
            }
          ]
        }
      ],
      '/do-it-yourself/': [
        {
          text: 'Crie o seu',
          items: [
            {
              text: 'Primeiros passos',
              link: '/do-it-yourself/getting-started'
            }, {
              text: 'Implantação',
              link: '/do-it-yourself/deployment'
            }, {
              text: 'Processamento',
              link: '/do-it-yourself/processing'
            }
          ]
        }
      ],
      '/app/': [
        {
          text: 'ATENÇÃO!',
          items: [
            {
              text: 'Apesar da capacidade da infraestrutura em gerenciar o armazenamento criptografado em nuvem, este aplicativo não oferece a segurança adequada para os dados armazenados localmente. Portanto, é altamente desaconselhável utilizar essa aplicação para guardar senhas pessoais ou qualquer informação sensível. Além disso, evite o uso de serviços de terceiros não confiáveis.'
            },
          ]
        },
        {
          items: [
            {
              text: '📂 Importar senhas',
              link: '/app/#js-import'
            }, {
              text: '📦 Exportar senhas',
              link: '/app/#js-export'
            }, {
              text: '🔑 Definir segredos',
              link: '/app/secret'
            },
          ]
        }
      ]
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/felixLuciano/safe-bin'
      }
    ],

    outline: 'deep',
    outlineTitle: 'Tópicos',

    lastUpdatedText: 'Updated Date',

    docFooter: {
      prev: 'Página anterior',
      next: 'Próxima página'
    },

    darkModeSwitchLabel: 'Aparência',
    returnToTopLabel: 'Voltar para o topo',
    langMenuLabel: 'Mudar idioma',
  
    footer: {
      message: 'Publicado sob a Licença MIT.<br/>Icones por <a href="https://github.com/microsoft/fluentui-emoji">microsoft/fluentui-emoji</a>.',
      copyright: 'Copyright © 2023 Luciano Felix'
    },
  },

  locales: {
    root: {
      label: 'Português',
      lang: 'pt'
    },
  },
})
