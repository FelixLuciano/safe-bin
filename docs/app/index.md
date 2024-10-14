---
title: App
titleTemplate: SafePass
aside: false
hero: true
prev: false
next: false
---

<script setup>
import { useLocalStorage, StorageSerializers } from '@vueuse/core'
import { toast } from 'vue3-toastify'
import crypto from 'crypto-js'
import sha1 from 'crypto-js/sha1'
import { computed, onMounted } from 'vue'

const cipher = useLocalStorage("safebin.safepass.cipher", "")
const secret = useLocalStorage("safebin.safepass.secret", "")
const storage = useLocalStorage("safebin.safepass.storage", [], {
  serializer: StorageSerializers.object
})

function getEncodedIndex(index) {
  const word = crypto.lib.WordArray.create([index])
  const sufix = crypto.enc.Base64.stringify(word);
  const key = secret.value + sufix

  return sha1(key).toString(crypto.enc.Hex)
}

const nextIndex = computed(() => {
  return getEncodedIndex(storage.value.length)
})

const encodedSecret = computed(() => {
  return crypto.enc.Base64.parse(secret.value)
})

function encrypt(message) {
  const encoded = crypto.enc.Utf8.parse(message)
  const encrypted = crypto.AES.encrypt(encoded, encodedSecret.value, {
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7,
  })

  return encrypted.toString()
}

function decrypt(message) {
  const encoded = crypto.enc.Base64.parse(message)

  const encrypted = crypto.AES.decrypt({ ciphertext: encoded }, encodedSecret.value, {
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7,
  })

  return encrypted.toString(crypto.enc.Utf8)
}

const actions = {
  import() {
    console.log("Import passwords")
  },
  export() {
    console.log("Export passwords")
  }
}

function togglePasswordInputVisibility (node, e) {
  node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
  node.props.type = node.props.type === 'password' ? 'text' : 'password'
}

async function savePassword(data) {
  const payload = encrypt(JSON.stringify(data))

  let response
  try {
    response = await fetch(`#/production/data/${nextIndex.value}`, {
      method: 'POST',
      body: JSON.stringify({
        data: payload
      })
    })
  }
  catch (e) {
    console.error(e)
    toast("Algo deu errado!", {
      type: toast.TYPE.ERROR
    })
  }

  if (response && response.ok) {
    toast("Senha salva com segurança", {
      type: toast.TYPE.SUCCESS
    })

    storage.value.push(payload)
  }
  else {
    toast("Algo deu errado!", {
      type: toast.TYPE.ERROR
    })
  }
}

onMounted(() => {
  const button_nodes = document.querySelectorAll('#VPSidebarNav .VPSidebarItem a')

  button_nodes.forEach((button_node) => {
    const action_name = button_node.hash.substr(4)

     if (action_name === '') return

    button_node.setAttribute("href", "#")

    button_node.addEventListener('click', (event) => {
      event.preventDefault()

      actions[action_name].call()
    })
  })
})
</script>

<VPDocHero
  class="VPDocHero VPDocHero--small-image"
  name="SafePass"
  text="Gerencie suas senhas"
  tagline="Crie, salve e gerencie suas senhas para que você possa fazer login em sites e apps com facilidade."
  image="/image/fluentui-emoji/locked_with_key.png"
/>

<FormKit
  type="form"
  submit-label="Salvar"
  @submit="savePassword"
>
    <FormKit
      type="text"
      name="address"
      id="address"
      label="Endereço"
      help="Endereço do site"
      placeholder="example.com"
      outer-class="form-save__input"
    />
    <FormKit
      type="password"
      name="password"
      id="password"
      validation="required"
      label="Senha"
      help="Senha"
      suffix-icon="eyeClosed"
      placeholder="password"
      @suffix-icon-click="togglePasswordInputVisibility"
    />
</FormKit>

## Senhas

<ul>
  <li v-for="item in storage">
    {{ decrypt(item) }}
  </li>
</ul>
