<template>
  <q-page>
    <div class="row" style="height: 100dvh;">
      <div class="col-12 col-md-6 flex flex-center bg-grey-2 q-pa-md">
        <div class="text-center">
          <q-img
            src="/undraw/register-icon.svg"
            class="q-mx-auto q-mb-md"
            style="max-width: 300px"
            contain
          />
          <h4 class="text-primary text-bold q-mb-sm">INTERM</h4>
          <p class="text-terciary">Plataforma gerenciamento de processos</p> 
        </div>
      </div>
      <div class="col-12 col-md-6 flex flex-center text-center">
        <div class="q-pa-md" style="width: 100%;">
          <q-form
            style="max-width: 500px; margin: auto;"
            class="q-glutter-md"
            ref="formRef"
            @submit.prevent="handleSubmit()"
          >
            <div class="text-center q-mb-lg">
              <h4 class="text-secondary text-bold q-mb-sm">Faça seu cadastro</h4>
              <p class="text-grey">Preencha seus dados para logar</p>
            </div>

            <q-input
              outlined
              v-model="nome"
              type="text"
              label="Nome"
              class="q-mb-md"
            />

            <q-input
              outlined
              hide-bottom-space
              v-model="email"
              label="Email"
              class="q-mb-md"
              :rules="[val => requiredField(val, 'Email'), val => emailRule(val)]"
            />

            <q-input
              outlined
              hide-bottom-space
              :type="passwordIsVisible ? 'text' : 'password'"
              v-model="password"
              class="q-mb-lg"
              label="Senha"
              :rules="[val => requiredField(val, 'Senha'), val => minLength(val, 6, 'Senha')]"
            >
              <template v-slot:append>
                <q-icon
                  :name="passwordIsVisible ? 'visibility_off' : 'visibility'"
                  @click="showPassword"
                />
              </template>
            </q-input>

            <q-card-section v-if="error" class="text-center q-pa-none">
              <p class="text-red-6">{{ error }}</p>
            </q-card-section>

            <q-btn
              block
              color="secondary"
              size="large"
              label="Cadastrar"
              :disable="isDisabled"
              style="width: 100%;"
              class="q-mb-sm"
              type="submit"
            />

            <div class="text-center q-mb-sm">
              ou
            </div>

            <q-btn
              :to="{ name: 'login' }"
              block
              outline
              color="primary"
              size="large"
              style="width: 100%;"
              class="q-mb-sm rounded-borders"
            >
              Tenho uma conta
            </q-btn>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '@/composables/useNotification';
import { useAuthService } from '@/services/api/auth.service';
import type { QForm } from 'quasar'

const notification = useNotification()
const router = useRouter()
const authService = useAuthService()

const nome = ref('');
const email = ref('');
const password = ref('');
const error = ref<string | null>(null)
const formRef = ref<InstanceType<typeof QForm> | null>(null)

const passwordIsVisible = ref(false)

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.){3}[0-9]{1,3}|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const isDisabled = computed(() => {
  if (!nome.value) return true
  if (!email.value) return true
  if (!password.value) return true
  if (password.value.length < 6) return true
  if (!isValidEmail(email.value)) return true

  return false
})

async function createUser() {
  try {
    await authService.register({
      nome: nome.value,
      email: email.value,
      password: password.value
    })

    notification.success('Usuário cadastrado com sucesso! Faça seu login')
    router.push({ name: 'login' })
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o cadastro. Erro: ' + (error.response?.data?.error || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }
  createUser()
}

function requiredField(val: string, fieldName = 'Campo') {
  return val.length > 0 || `${fieldName} é obrigatório`
}

function minLength(val: string, length = 6, fieldName = 'Senha') {
  return val.length >= length || `${fieldName} deve ter no mínimo ${length} caracteres`
}

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

function emailRule(val: string) {
  return isValidEmail(val) || 'Email inválido'
}

function showPassword() {
  passwordIsVisible.value = !passwordIsVisible.value
}
</script>
