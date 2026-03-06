<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">{{editMode ? 'Editar Cliente' : 'Novo Cliente'}}</h4>
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
            v-model="formData.nome"
            label="Nome"
            dense
            outlined
          />
        </div>

        <div class="col-6">
          <InputTextComponent
            v-model="formData.email"
            label="Email"
            dense
            outlined
          />
        </div>

        <div class="col-4">
          <InputTextComponent
            v-model="formData.telefone"
            label="Telefone"
            dense
            outlined
          />
        </div>

        <div class="col-4">
          <SelectComponent
            v-model="formData.tipoCliente"
            label="Tipo Cliente"
            :options="tipoCliente"
            option-value="value"
            option-label="title"
            :rules="[val => requiredField(val, 'Tipo Cliente')]"
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

        <div class="col-12">
          <InputTextComponent
            v-model="formData.observacoes"
            label="Observações"
            dense
            outlined
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
          :to="{name: 'clientes'}"
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
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { QForm, QStepper } from 'quasar';
import { useNotification } from '@/composables/useNotification';
import InputTextComponent from '@/components/InputTextComponent.vue';
import SelectComponent from '@/components/SelectComponent.vue';
import { useClienteService } from '@/services';

const route = useRoute()
const clienteService = useClienteService()
const notification = useNotification()
const router = useRouter()

const idProcesso = ref<string | undefined>(undefined)
const editMode = ref(false)
const step = ref(1)
const stepperRef = ref<QStepper>()
const search = ref('')
const isLoading = ref(false)
const formRef = ref<InstanceType<typeof QForm> | null>(null)

const formData = ref({
  id: '',
  nome: '',
  email: '',
  telefone: '',
  tipoCliente: null,
  status: true,
  observacoes: ''
})


const status = [
  { title: 'Ativo', value: true },
  { title: 'Inativo', value: false },
]

const tipoCliente = [
  { title: 'Pessoa Física', value: 'PESSOA_FISICA' },
  { title: 'Pessoa Jurídica', value: 'PESSOA_JURIDICA' },
]


onMounted(async () => {
  try {
    const idRota = route.params.id as string

    if(idRota) {
      idProcesso.value = idRota
      const response = await clienteService.getById(idProcesso.value)
      formData.value = response
      if(response) editMode.value = true
    }
  } catch(error) {
    console.error(error)
  }
})

function requiredField(val: any,fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }

  if (editMode.value) {
    updateCliente()
  } else {
    createCliente()
  }
}

async function createCliente() {
  try {
    await clienteService.create({ 
      ...formData.value,
    })

    notification.success('Cliente cadastrado com sucesso!')
    router.push({name: 'clientes'})
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + (error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }
}

async function updateCliente() {
  try {
    await clienteService.update(formData.value.id, { 
      ...formData.value,
    })

    notification.success('Cliente atualizado com sucesso!')
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + (error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }
}
</script>