<template>
  <q-page>
    <div class="row" style="height: 100dvh;">
      <div class="col-12 col-md-6 flex flex-center bg-grey-2 q-pa-md">
        <div class="text-center">
          <q-img
            src="/undraw/login-icon.svg"
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
            @submit.prevent="handleSubmit"
          >
            <div class="text-center q-mb-lg">
              <h2 class="text-secondary text-bold q-mb-sm">Login</h2>
              <p class="text-grey">Faça o login na sua conta!</p>
            </div>

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
              unelevated
              color="secondary"
              size="large"
              style="width: 100%;"
              class="q-mb-sm"
              label="Entrar"
              :disable="isDisabled"
              type="submit"
            />

            <div class="text-center q-mb-sm">
              ou
            </div>

            <q-btn
              :to="{ name: 'register' }"
              block
              outline
              color="primary"
              size="large"
              style="width: 100%;"
              class="q-mb-sm"
            >
              Cadastre-se
            </q-btn>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { useAuthService } from '@/services/api/auth.service';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { QForm } from 'quasar'

const notification = useNotification()
const router = useRouter()
const authService = useAuthService()

const email = ref('');
const password = ref('');
const passwordIsVisible = ref(false)

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.){3}[0-9]{1,3}|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const error = ref<string | null>(null)

const formRef = ref<InstanceType<typeof QForm> | null>(null)

const isDisabled = computed(() => {
  if (!email.value) return true
  if (!password.value) return true
  if (password.value.length < 6) return true
  if (!isValidEmail(email.value)) return true

  return false
})

function minLength(val: string, length = 6, fieldName = 'Senha') {
  return val.length >= length || `${fieldName} deve ter no mínimo ${length} caracteres`
}

function requiredField(val: string, fieldName = 'Campo') {
  return val.length > 0 || `${fieldName} é obrigatório`
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

async function handleSubmit() {
  if (!formRef.value) return

  const isValid = await formRef.value.validate()
  
  if (!isValid) {
    notification.error('Formulário inválido')
    return
  }

  loginUser()
}

async function loginUser() {
  try {
    const response = await authService.login({
      email: email.value,
      password: password.value
    }) 

    if (response?.token) {
      localStorage.setItem('token', response.token)
      notification.success('Login realizado com sucesso')
      router.push({ name: 'home' })
    } else {
      notification.error('Token não encontrado')
    }
  } catch (error: any) {
    if (error.response) {
      notification.error('Não foi possível realizar o login. Erro: ' + (error.response?.data?.error || error.response?.data?.detail || error.code || error.message || ''), 9000)
      console.error('ERRO', error.data)
    }
  }
}
</script>