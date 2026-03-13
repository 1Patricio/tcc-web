<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <div>
          <h4 class="text-terciary text-bold q-my-sm">
            {{ editMode ? 'Editar Modelo de Petição' : 'Novo Modelo de Petição' }}
          </h4>
          <p class="text-terciary q-my-none" v-html="editMode
              ? `Altere o conteúdo do modelo <span class='text-primary text-bold'>${formData?.nome}</span>`
              : 'Crie um novo modelo de petição para reutilizar'
            "></p>
        </div>
      </div>

      <div>
        <q-btn color="green" size="small" :label="editMode ? 'Atualizar' : 'Salvar modelo'" @click="handleSubmit()" />
      </div>
    </div>

    <div class="bg-white q-pa-lg" style="border: 0.4px solid gray;">
      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <InputTextComponent v-model="formData.nome" label="Nome do modelo" dense outlined
              placeholder="Ex: Petição Inicial Trabalhista" :rules="[val => requiredField(val, 'Nome do modelo')]" />
          </div>

          <div class="col-12 col-md-6">
            <SelectComponent v-model="formData.tipo" label="Tipo" :options="tiposPeticao" option-value="value"
              option-label="title" :rules="[val => requiredField(val, 'Tipo')]" />
          </div>

          <div class="col-12">
            <div class="flex justify-between items-center q-mb-md">
              <label class="text-subtitle2 text-weight-medium q-mb-sm block">Conteúdo da petição</label>
              <div>
                <q-btn label="Copiar Conteúdo" @click="copyText()" color="primary" size="small"
                  :disable="!formData.conteudo" class="q-mr-sm" />
                <q-btn label="Gerar modelo" @click="enviar()"
                  style="background: linear-gradient(45deg, #003366, #7928CA); color: white;" icon="bolt" size="small"
                  :disable="!formData.tipo" :loading="loading" />
              </div>
            </div>
            <TextEditorComponent v-model="formData.conteudo" />
          </div>
        </div>

        <div class="row justify-end q-mt-lg">
          <q-btn color="primary" size="small" label="Cancelar" class="q-mr-sm" flat :to="{ name: 'peticoes' }" />
          <q-btn color="green" size="small" :label="editMode ? 'Atualizar' : 'Salvar modelo'" type="submit" />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar, type QForm } from 'quasar'
import { useNotification } from '@/composables/useNotification'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import OpenAI from "openai"
import TextEditorComponent from '@/components/TextEditorComponent.vue'
import type { PeticaoModelo } from '@/types/peticoes/PeticaoModelo'
import { usePeticaoService } from '@/services/api/peticao.service'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
  dangerouslyAllowBrowser: true,
})

const route = useRoute()
const notification = useNotification()
const $q = useQuasar();
const peticaoService = usePeticaoService()

const editMode = ref(false)
const idPeticao = ref<string>()
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const loading = ref(false)

const formData = ref({
  nome: '',
  tipo: null as string | null,
  conteudo: '',
})

const tiposPeticao = [
  { title: 'Inicial', value: 'INICIAL' },
  { title: 'Contestação', value: 'CONTESTACAO' },
  { title: 'Recurso', value: 'RECURSO' },
  { title: 'Agravo', value: 'AGRAVO' },
  { title: 'Outros', value: 'OUTROS' },
]

function requiredField(val: unknown, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

onMounted(async () => {
  const idRota = route.params.id as string

  if (idRota && idRota !== 'novo') {
    editMode.value = true
    idPeticao.value = idRota

    const peticao = await peticaoService.getById(idPeticao.value)

    if (peticao) {
      formData.value = {
        nome: peticao.nome,
        tipo: peticao.tipo,
        conteudo: peticao.conteudo || '',
      }
    }
  }
})

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) {
    notification.error('Preencha os campos obrigatórios')
    return
  }

  if (editMode.value && idPeticao.value) {
    peticaoService.update(idPeticao.value, {
      ...formData.value
    })
    
    notification.success('Modelo atualizado com sucesso!')
  }else {
    const novo: PeticaoModelo = {
      nome: formData.value.nome,
      tipo: formData.value.tipo!,
      conteudo: formData.value.conteudo,
    }

    peticaoService.create(novo)
    notification.success('Modelo salvo com sucesso!')
  }
}

async function enviar() {
  if (!formData.value.tipo?.trim()) return

  loading.value = true

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        {
          role: "system",
          content: `Você é um advogado especialista em direito brasileiro.

          Sua tarefa é gerar um MODELO DE PETIÇÃO JURÍDICA.

          IMPORTANTE:
          - A resposta deve ser SOMENTE uma STRING em HTML.
          - NÃO utilize markdown.
          - NÃO utilize blocos de código.
          - NÃO explique nada antes ou depois.
          - Retorne apenas o HTML puro.

          Regras de formatação:
          - Utilize apenas HTML simples compatível com editores rich text.
          - Use principalmente as seguintes tags:
          <p>, <strong>, <em>, <h2>, <h3>, <ul>, <ol>, <li>, <br>

          Estrutura obrigatória da petição:

          1. Endereçamento
          2. Qualificação das partes
          3. Dos fatos
          4. Do direito
          5. Dos pedidos
          6. Valor da causa
          7. Fechamento (Termos em que pede deferimento)

          Regras de estilo:
          - Use parágrafos <p>
          - Use <strong> para títulos importantes
          - Use <h3> para seções
          - Separe seções com espaçamento
          - Linguagem jurídica formal brasileira

          Tipo de petição:
          ${formData.value.tipo}

          Retorne um modelo completo com conteúdo realista.`
        },
        {
          role: "user",
          content: `Caso do cliente: ${formData.value.conteudo}`
        }
      ],
      response_format: { type: "text" }
    })

    const textoResposta = response.choices[0]?.message?.content || '{}'
    formData.value.conteudo = textoResposta

    notification.success('Modelo gerado com sucesso!')
  } catch (erro: any) {
    console.error('Erro:', erro)
    notification.error('Erro ao gerar modelo: ' + (erro.message || 'Desconhecido'))
  } finally {
    loading.value = false
  }
}

function htmlToPlainText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent?.trim() ?? div.innerText?.trim() ?? ''
}

async function copyText() {
  const html = formData.value.conteudo
  if (!html?.trim()) return

  try {
    const plain = htmlToPlainText(html)
    const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`
    const htmlBlob = new Blob([wrappedHtml], { type: 'text/html' })
    const plainBlob = new Blob([plain], { type: 'text/plain' })
    const item = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': plainBlob,
    })
    await navigator.clipboard.write([item])
    $q.notify({
      message: 'Conteúdo copiado (formatação preservada para Docs/Word)!',
      color: 'green-5',
      icon: 'check_circle',
      position: 'bottom',
    })
  } catch {
    $q.notify({
      message: 'Falha ao copiar o texto.',
      color: 'red-5',
      icon: 'error',
      position: 'bottom',
    })
  }
}
</script>
