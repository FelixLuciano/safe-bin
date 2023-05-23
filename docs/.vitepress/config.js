import { defineConfig } from 'vitepress'
import { createWindowsGroup } from './plugins/markdown/windows-container.ts'

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
        link: '/app/'
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

    sidebar: [
      {
        text: 'Examples',
        items: [
          {
            text: 'Início',
            link: '/'
          }, {
            text: 'Crie o seu',
            link: '/deploy/'
          }
        ]
      }
    ],

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
      copyright: 'Copyright © 2023'
    },
  },

  markdown: {
    config(md) {
      md.use(...createWindowsGroup())
    },
  },

  locales: {
    root: {
      label: 'Português',
      lang: 'pt'
    },
  },
})
