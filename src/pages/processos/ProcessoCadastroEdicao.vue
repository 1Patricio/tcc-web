<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">
          {{ editMode ? 'Editar Processo' : 'Novo Processo' }}
        </h4>
      </div>
    </div>

    <div class="bg-white q-pa-lg" style="border: 0.4px solid gray;">
      <q-form ref="formRef" @submit.prevent="handleSubmit">
        <div class="row q-col-gutter-md">

          <div class="col-6">
            <InputTextComponent
              v-model="formData.numeroProcesso"
              label="Número do Processo"
              dense
              outlined
              :rules="[val => requiredField(val, 'Número do Processo')]"
            />
          </div>

          <div class="col-6">
            <SelectComponent
              v-model="formData.clienteId"
              label="Cliente*"
              :options="clientes"
              option-value="id"
              option-label="nome"
              :rules="[val => requiredField(val, 'Cliente')]"
            />
          </div>

          <div class="col-6">
            <SelectComponent
              v-model="formData.tipoAcaoProcesso"
              label="Tipo de Ação"
              :options="tipoAcao"
              option-value="value"
              option-label="title"
            />
          </div>

          <div class="col-6">
            <InputTextComponent
              v-model="formData.comarca"
              label="Comarca"
              dense
              outlined
            />
          </div>

          <div class="col-12">
            <InputTextComponent
              v-model="formData.vara"
              label="Vara"
              dense
              outlined
            />
          </div>

          <div class="col-4">
            <InputDateComponent
              v-model="formData.dataDistribuicao"
              label="Data de Distribuição"
              dense
              outlined
            />
          </div>

          <div class="col-4">
            <InputMoneyComponent
              v-model="formData.valorCausa"
              label="Valor da Causa"
              dense
              outlined
            />
          </div>

          <div class="col-4">
            <SelectComponent
              v-model="formData.status"
              label="Status*"
              :options="status"
              option-value="value"
              option-label="title"
              :rules="[val => requiredField(val, 'Status')]"
            />
          </div>

        </div>

        <div class="row justify-end q-mt-lg">
          <q-btn
            color="primary"
            size="small"
            :label="'Cancelar'"
            class="q-mr-sm"
            flat
            :to="{name: 'processos'}"
          />

          <q-btn
            color="green"
            size="small"
            :label="editMode ? 'Atualizar' : 'Cadastrar'"
            type="submit"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { QForm } from 'quasar'
import { useNotification } from '@/composables/useNotification'
import InputDateComponent from '@/components/InputDateComponent.vue'
import InputMoneyComponent from '@/components/InputMoneyComponent.vue'
import InputTextComponent from '@/components/InputTextComponent.vue'
import SelectComponent from '@/components/SelectComponent.vue'
import type { Cliente } from '@/types/clientes/Cliente'
import { useClienteService, useProcessoService } from '@/services'

const route = useRoute()
const processoService = useProcessoService()
const clienteService = useClienteService()
const notification = useNotification()

const editMode = ref(false)
const idProcesso = ref<string>()
const clientes = ref<Cliente[]>([])
const formRef = ref<InstanceType<typeof QForm> | null>(null)

const formData = ref({
  id: '',
  numeroProcesso: '',
  clienteId: '',
  tipoAcaoProcesso: null as string | null,
  status: null as string | null,
  vara: '',
  comarca: '',
  dataDistribuicao: null as string | null,
  valorCausa: null as number | null
})

const status = [
  { title: 'Andamento', value: 'ANDAMENTO' },
  { title: 'Julgamento', value: 'JULGAMENTO' },
  { title: 'Sentença', value: 'SENTENCA' },
  { title: 'Recurso', value: 'RECURSO' },
  { title: 'Arquivado', value: 'ARQUIVADO' }
]

const tipoAcao = [
  { title: 'Cível', value: 'CIVEL' },
  { title: 'Trabalhista', value: 'TRABALHISTA' },
  { title: 'Criminal', value: 'CRIMINAL' },
  { title: 'Tributário', value: 'TRIBUTARIO' },
  { title: 'Família', value: 'FAMILIA' },
  { title: 'Consumidor', value: 'CONSUMIDOR' },
  { title: 'Outros', value: 'OUTROS' }
]

function isoToBr(date: string) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

function brToIso(date: string) {
  if (!date) return ''
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}`
}

function requiredField(val: any, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

onMounted(async () => {
  const idRota = route.params.id as string

  if (idRota) {
    editMode.value = true
    idProcesso.value = idRota

    const response = await processoService.getById(idRota)

    formData.value = {
      ...response,
      dataDistribuicao: isoToBr(response.dataDistribuicao)
    }
  }

  const clientesResponse = await clienteService.getAll()
  clientes.value = clientesResponse
})

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }

  if (editMode.value) {
    await updateProcesso()
  } else {
    await createProcesso()
  }
}

async function createProcesso() {
  try{
    await processoService.create({
      ...formData.value,
      valorCausa: Number(formData.value.valorCausa),
      dataDistribuicao: formData.value.dataDistribuicao ? brToIso(formData.value.dataDistribuicao) : null
    })
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + (error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }

  notification.success('Processo cadastrado com sucesso!')
}

async function updateProcesso() {
  if (!idProcesso.value) return
  
  try {
    await processoService.update(idProcesso.value, {
      ...formData.value,
      valorCausa: Number(formData.value.valorCausa),
      dataDistribuicao: formData.value.dataDistribuicao ? brToIso(formData.value.dataDistribuicao) : ''
    }) 
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + (error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }

  notification.success('Processo atualizado com sucesso!')
}
</script>