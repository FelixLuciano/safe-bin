// https://github.com/vuejs/vitepress/blob/b26ce48edc472b4e68601923d436bf7cc7cf7f60/src/node/markdown/plugins/containers.ts

import container from 'markdown-it-container'
import type { RenderRule } from 'markdown-it/lib/renderer'
import { nanoid } from 'nanoid'


export function extractTitle(info: string) {
  return info.match(/\[(.*)\]/)?.[1] || extractLang(info) || 'txt'
}

function extractLang(info: string) {
    return info
      .trim()
      .replace(/:(no-)?line-numbers({| |$).*/, '')
      .replace(/(-vue|{| ).*$/, '')
      .replace(/^vue-html$/, 'template')
}

type ContainerArgs = [typeof container, string, { render: RenderRule }]

export function createWindowsGroup(): ContainerArgs {
    return [
      container,
      'windows-group',
      {
        render(tokens, idx) {
          if (tokens[idx].nesting === 1) {
            const name = nanoid(5)
            let tabs = ''
            let checked = 'checked="checked"'
  
            for (
              let i = idx + 1;
              !(
                tokens[i].nesting === -1 &&
                tokens[i].type === 'container_windows-group_close'
              );
              ++i
            ) {
              if (tokens[i].type === 'fence' && tokens[i].tag === 'code') {
                const title = extractTitle(tokens[i].info)
                const id = nanoid(7)
                tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label for="tab-${id}">${title}</label>`
  
                if (checked) {
                  tokens[i].info += ' active'
                  checked = ''
                }
              }
            }
  
            return `<div class="vp-code-group vp-code-group--windows"><div class="tabs"><div></div><div></div><div></div>${tabs}</div><div class="blocks">\n`
          }
          return `</div></div>\n`
        }
      }
    ]
  }
