---
title: App
titleTemplate: Segredo
aside: false
sidebar: false
hero: true
prev:
  text: App
  link: /app/
next: false
---

<script setup>
import { useLocalStorage, StorageSerializers } from '@vueuse/core'
import { toast } from 'vue3-toastify'

const cipher = useLocalStorage("safebin.safepass.cipher", "")
const secret = useLocalStorage("safebin.safepass.secret", "")
const storage = useLocalStorage("safebin.safepass.storage", [], {
  serializer: StorageSerializers.object
})

function clearStorage() {
  storage.value = []
}

function togglePasswordInputVisibility (node, e) {
  node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
  node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

async function updateSecrets() {
  let response

  try {
    response = await fetch("https://iestsfp9gh.execute-api.us-east-1.amazonaws.com/production/key")
  }
  catch {
    toast("Algo deu errado!", {
      type: toast.TYPE.ERROR
    })
  }

  if (response) {
    const data = await response.json()

    cipher.value = data.cipher
    secret.value = data.secret
    
    clearStorage()
    toast("Segredo atualizado!", {
      type: toast.TYPE.SUCCESS
    })
  }
}
</script>

<VPDocHero
  class="VPDocHero VPDocHero--small-image"
  name="Segredo"
  tagline="Estas são suas chaves de encriptação. Sem elas, nada funciona. Então guarde-as em segurança."
/>


<FormKit
  type="form"
  :value="{
    cipher: cipher,
    secret: secret
  }"
  submit-label="Gerar novas"
  :submit-attrs="{
    'prefix-icon': 'warning',
    'help': 'Potencial destrutivo'
  }"
  @submit="updateSecrets"
>
    <FormKit
      type="password"
      name="cipher"
      id="cipher"
      label="Cifra"
      help="Chave de autorização"
      suffix-icon="eyeClosed"
      v-model="cipher"
      @input="clearStorage"
      @suffix-icon-click="togglePasswordInputVisibility"
    />
    <FormKit
      type="password"
      name="secret"
      id="secret"
      label="Segredo"
      help="Chave de encriptação"
      suffix-icon="eyeClosed"
      v-model="secret"
      @input="clearStorage"
      @suffix-icon-click="togglePasswordInputVisibility"
    />
</FormKit>
