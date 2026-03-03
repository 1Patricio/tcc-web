<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Novo Processo</h4>
      </div>
    </div>
    <div class="bg-white q-pa-lg" style="border: 0.4px solid gray;">
      <q-form
        ref="formRef"
        @submit.prevent="handleSubmit()"
      >

      <div class="row q-col-gutter-md">
        <div class="col-6">
          <InputTextComponent
            v-model="formData.numeroProcesso"
            label="Número do Processo"
            dense
            outlined
          />
        </div>

        <div class="col-6">
          <SelectComponent
            v-model="formData.clienteId"
            label="Cliente"
            :options="clientes"
            option-value="id"
            option-label="nome"
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
            label="Status"
            :options="status"
            option-value="value"
            option-label="title"
          />
        </div>
      </div>
        <q-btn
          block
          color="secondary"
          size="small"
          label="Cadastrar"
          style="width: 100%;"
          class="q-mt-lg"
          type="submit"
        />
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import type { QForm, QStepper } from 'quasar';
import { useNotification } from '@/composables/useNotification';
import InputDateComponent from '@/components/InputDateComponent.vue';
import InputMoneyComponent from '@/components/InputMoneyComponent.vue';
import InputTextComponent from '@/components/InputTextComponent.vue';
import SelectComponent from '@/components/SelectComponent.vue';
import type { Cliente } from '@/types/clientes/Cliente';
import { StatusProcessoEnum } from '@/types/processos/StatusProcessoEnum';
import { useClienteService, useProcessoService } from '@/services';

const route = useRoute()
const processoService = useProcessoService()
const clienteService = useClienteService()
const notification = useNotification()

const idProcesso = ref<string | undefined>(undefined)
const selectedUser = ref('')
const step = ref(1)
const stepperRef = ref<QStepper>()
const search = ref('')
const isLoading = ref(false)
const cliente = ref<Cliente>()
const clientes = ref<Cliente[]>([])
const formRef = ref<InstanceType<typeof QForm> | null>(null)
const tipoAcaoProcesso = StatusProcessoEnum

const formData = ref({
  numeroProcesso: '',
  clienteId: '',
  tipoAcaoProcesso: null,
  status: null,
  vara: '',
  comarca: '',
  dataDistribuicao: '',
  valorCausa: null
})

const status = [
  { title: 'Andamento', value: 'ANDAMENTO' },
  { title: 'Julgamento', value: 'JULGAMENTO' },
  { title: 'Sentença', value: 'SENTENCA' },
  { title: 'Recurso', value: 'RECURSO' },
  { title: 'Arquivado', value: 'ARQUIVADO' },
]

const tipoAcao = [
  { title: 'Cível', value: 'CIVEL' },
  { title: 'Trabalhista', value: 'TRABALHISTA' },
  { title: 'Criminal', value: 'CRIMINAL' },
  { title: 'Tributário', value: 'TRIBUTARIO' },
  { title: 'Família', value: 'FAMILIA' },
  { title: 'Consumidor', value: 'CONSUMIDOR' },
  { title: 'Outros', value: 'OUTROS' },
]


onMounted(async () => {
  try {
    const idRota = route.params.id as string

    if(idRota) {
      idProcesso.value = idRota
      const response = await processoService.getById(idProcesso.value)
      formData.value = response
      formData.value.clienteId = response.clienteId
    }
    await getAllClientes()
    await _getCliente(formData.value.clienteId)
  } catch(error) {
    console.error(error)
  }
})

async function _getCliente(clienteId: string) {
  isLoading.value = true
  try {
    const clienteEdit = clientes.value.find((c) => c.id === clienteId)
  } catch {
    notification.error("Erro ao buscar cliente")
  } finally {
    isLoading.value = false
  }
}

async function getAllClientes() {
  isLoading.value = true
  try {
    const response = await clienteService.getAll()
    clientes.value = response 
  } catch {
    notification.error("Erro ao buscar clientes")
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }
  createProcesso()
}

function formatDateToISO(date: string) {
  const [day, month, year] = date.split('/')
  return `${year}-${month}-${day}`
}

async function createProcesso() {
  try {
    await processoService.create({ 
      ...formData.value,
      valorCausa: Number(formData.value.valorCausa),
      dataDistribuicao: formatDateToISO(formData.value.dataDistribuicao)
    })

    notification.success('Processo cadastrado com sucesso!')
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + (error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }
}
</script>