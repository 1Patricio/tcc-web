<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">{{ editMode ? 'Editar Usuário' : 'Novo Usuário' }}</h4>
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
            :rules="[val => requiredField(val, 'Nome')]"
          />
        </div>

        <div class="col-6">
          <InputTextComponent
            v-model="formData.email"
            label="Email"
            dense
            outlined
            :rules="[val => requiredField(val, 'Email')]"
          />
        </div>

        <div class="col-6">
          <InputTextComponent
            v-model="formData.password"
            :label="editMode ? 'Nova senha (opcional)' : 'Senha'"
            type="password"
            dense
            outlined
            :rules="editMode ? [] : [val => requiredField(val, 'Senha'), val => minLength(val, 6, 'Senha')]"
          />
        </div>

        <div v-if="editMode" class="col-6">
          <SelectComponent
            v-model="formData.ativo"
            label="Status"
            :options="statusOptions"
            option-value="value"
            option-label="title"
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
          :to="{name: 'configuracoes-usuarios'}"
        />

        <q-btn
          color="green"
          size="small"
          :label="editMode ? 'Atualizar' : 'Cadastrar'"
          type="submit"
          :loading="isLoading"
        />
      </div>

      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar, type QForm } from 'quasar';
import { useNotification } from '@/composables/useNotification';
import InputTextComponent from '@/components/InputTextComponent.vue';
import SelectComponent from '@/components/SelectComponent.vue';
import { useUsuarioService } from '@/services';
import { getApiErrorMessage } from '@/utils/apiError';

const route = useRoute()
const usuarioService = useUsuarioService()
const notification = useNotification()
const router = useRouter()
const $q = useQuasar()

const idUsuario = ref<string | undefined>(undefined)
const editMode = ref(false)
const isLoading = ref(false)
const ativoOriginal = ref(true)
const formRef = ref<InstanceType<typeof QForm> | null>(null)

const formData = ref({
  id: '',
  nome: '',
  email: '',
  password: '',
  ativo: true,
})

const statusOptions = [
  { title: 'Ativo', value: true },
  { title: 'Inativo', value: false },
]

onMounted(async () => {
  try {
    const idRota = route.params.id as string

    if (idRota) {
      idUsuario.value = idRota
      const response = await usuarioService.getById(idUsuario.value)
      formData.value = { ...response, password: '' }
      ativoOriginal.value = response.ativo
      editMode.value = true
    }
  } catch (error) {
    console.error(error)
  }
})

function requiredField(val: any, fieldName = 'Campo'): boolean | string {
  return !!val || `${fieldName} é obrigatório`
}

function minLength(val: string, length = 6, fieldName = 'Senha') {
  return (val?.length ?? 0) >= length || `${fieldName} deve ter no mínimo ${length} caracteres`
}

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()

  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }

  if (editMode.value && ativoOriginal.value && !formData.value.ativo) {
    $q.dialog({
      title: 'Inativar usuário',
      message: `Ao inativar "${formData.value.nome}", o acesso dele ao sistema é bloqueado imediatamente. Deseja continuar?`,
      cancel: { label: 'Cancelar', flat: true },
      ok: { label: 'Inativar', color: 'red' },
      persistent: true,
    }).onOk(salvarUsuario)
    return
  }

  await salvarUsuario()
}

async function salvarUsuario() {
  isLoading.value = true
  try {
    if (editMode.value) {
      await updateUsuario()
    } else {
      await createUsuario()
    }
  } finally {
    isLoading.value = false
  }
}

async function createUsuario() {
  try {
    await usuarioService.create({
      nome: formData.value.nome,
      email: formData.value.email,
      password: formData.value.password,
    })

    notification.success('Usuário cadastrado com sucesso!')
    router.push({ name: 'configuracoes-usuarios' })
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro:' + getApiErrorMessage(error), 9000)
      console.error('ERRO', error.data)
    }
  }
}

async function updateUsuario() {
  try {
    await usuarioService.update(formData.value.id, {
      nome: formData.value.nome,
      email: formData.value.email,
      ativo: formData.value.ativo,
    })

    if (formData.value.password) {
      await usuarioService.changeSenha(formData.value.id, formData.value.password)
    }

    notification.success('Usuário atualizado com sucesso!')
    router.push({ name: 'configuracoes-usuarios' })
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível atualizar o usuário. Erro:' + getApiErrorMessage(error), 9000)
      console.error('ERRO', error.data)
    }
  }
}
</script>
