<template>
  <div class="q-pa-md">
    <div
      class="flex items-center q-mb-md"
      style="gap: 8px"
    >
      <q-icon
        name="home"
        color="primary"
        size="22px"
        class="cursor-pointer"
        @click="router.push({ name: 'home' })"
      />
      <span
        class="text-grey-5"
        style="font-size: 16px"
        >|</span
      >
      <span
        class="text-grey-7 text-bold"
        style="font-size: 14px"
        >Meu perfil</span
      >
    </div>

    <div
      class="bg-white q-pa-lg"
      style="border: 1px solid #e0e0e0; border-radius: 8px"
    >
      <div
        class="text-subtitle1 text-bold q-mb-lg"
        style="color: #4a4a4a"
      >
        Informações do usuário
      </div>

      <q-form
        ref="formRef"
        @submit.prevent="handleSubmit"
      >
        <div
          class="row items-start"
          style="gap: 48px"
        >
          <div
            style="
              position: relative;
              width: 200px;
              height: 200px;
              flex-shrink: 0;
            "
          >
            <input
              ref="inputFoto"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              style="display: none"
              @change="onSelecionarFoto"
            />
            <div
              class="full-width full-height flex flex-center"
              style="
                border-radius: 50%;
                background: white;
                overflow: hidden;
                border: 2px solid #e0e0e0;
                width: 200px;
                height: 200px;
              "
            >
              <div
                v-if="previewFoto || form.fotoPerfil"
                :style="{
                  width: '200px',
                  height: '200px',
                  backgroundImage: `url(${previewFoto || form.fotoPerfil})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }"
              />
              <q-icon
                v-else
                name="person"
                size="72px"
                color="grey-4"
              />
            </div>

            <q-btn
              round
              unelevated
              color="grey-6"
              size="sm"
              icon="settings"
              style="position: absolute; bottom: 4px; left: 4px"
            >
              <q-menu :offset="[8, 4]">
                <q-list
                  dense
                  padding
                  style="min-width: 130px"
                >
                  <q-item
                    v-close-popup
                    clickable
                    @click="inputFoto?.click()"
                  >
                    <q-item-section avatar>
                      <q-icon
                        name="upload"
                        color="blue-6"
                        size="20px"
                      />
                    </q-item-section>
                    <q-item-section style="font-size: 13px"
                      >Upload</q-item-section
                    >
                  </q-item>
                  <q-item
                    v-close-popup
                    clickable
                    @click="removerFoto"
                  >
                    <q-item-section avatar>
                      <q-icon
                        name="delete"
                        color="negative"
                        size="20px"
                      />
                    </q-item-section>
                    <q-item-section style="font-size: 13px"
                      >Remover</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div
            class="col column"
            style="gap: 18px"
          >
            <div
              class="column"
              style="gap: 6px"
            >
              <span class="field-label">Nome *</span>
              <q-input
                v-model="form.nome"
                outlined
                dense
                hide-bottom-space
                bg-color="white"
                :rules="[(val) => val.length > 0 || 'Nome é obrigatório']"
              />
            </div>

            <div
              class="column"
              style="gap: 6px"
            >
              <span class="field-label">E-mail *</span>
              <q-input
                v-model="form.email"
                outlined
                dense
                hide-bottom-space
                bg-color="white"
                :rules="[(val) => val.length > 0 || 'E-mail é obrigatório']"
              />
            </div>

            <div
              class="row"
              style="gap: 16px"
            >
              <div
                class="col column"
                style="gap: 6px"
              >
                <span class="field-label">Senha *</span>
                <q-input
                  v-model="form.novaSenha"
                  outlined
                  dense
                  hide-bottom-space
                  bg-color="white"
                  :type="showNovaSenha ? 'text' : 'password'"
                  :rules="[
                    (val) =>
                      val.length === 0 ||
                      val.length >= 6 ||
                      'Mínimo 6 caracteres',
                  ]"
                >
                  <template #append>
                    <q-icon
                      :name="showNovaSenha ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-grey-5"
                      @click="showNovaSenha = !showNovaSenha"
                    />
                  </template>
                </q-input>
              </div>

              <div
                class="col column"
                style="gap: 6px"
              >
                <span class="field-label">Repetir senha *</span>
                <q-input
                  v-model="form.confirmarSenha"
                  outlined
                  dense
                  hide-bottom-space
                  bg-color="white"
                  :type="showConfirmar ? 'text' : 'password'"
                  :rules="[
                    (val) =>
                      val.length === 0 ||
                      val === form.novaSenha ||
                      'As senhas não coincidem',
                  ]"
                >
                  <template #append>
                    <q-icon
                      :name="showConfirmar ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer text-grey-5"
                      @click="showConfirmar = !showConfirmar"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div
              v-if="form.novaSenha.length > 0"
              class="row items-center q-pa-sm rounded-borders"
              style="background: #f5f5f5; gap: 12px"
            >
              <q-icon
                name="info"
                color="orange-8"
                size="20px"
                style="flex-shrink: 0"
              />
              <span style="color: #e65100; font-size: 13px; line-height: 1.4">
                Ao alterar a senha, seu usuário será deslogado de todos os
                dispositivos e precisará fazer login novamente com a nova senha
              </span>
            </div>
          </div>
        </div>

        <div
          class="row justify-end q-mt-lg"
          style="gap: 8px"
        >
          <q-btn
            flat
            color="primary"
            no-caps
            label="Cancelar"
            @click="router.back()"
          />
          <q-btn
            color="green"
            no-caps
            icon="check"
            label="Salvar"
            type="submit"
            :loading="isLoading"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { QForm } from 'quasar'
import { useAuthService } from '@/services/api/auth.service'
import { useNotification } from '@/composables/useNotification'
import { getApiErrorMessage } from '@/utils/apiError'

const router = useRouter()
const authService = useAuthService()
const notification = useNotification()

const formRef = ref<InstanceType<typeof QForm> | null>(null)
const inputFoto = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const showNovaSenha = ref(false)
const showConfirmar = ref(false)

const form = ref({
  nome: '',
  email: '',
  novaSenha: '',
  confirmarSenha: '',
  fotoPerfil: '',
})
const fotoSelecionada = ref<File | null>(null)
const previewFoto = ref<string>('')

onMounted(async () => {
  const response = await authService.refresh()
  form.value.nome = response.user.nome
  form.value.email = response.user.email
  form.value.fotoPerfil = response.user.fotoPerfil ?? ''
})

function onSelecionarFoto(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  fotoSelecionada.value = file
  const reader = new FileReader()
  reader.onload = (loadEvent) => {
    previewFoto.value = loadEvent.target?.result as string
  }
  reader.readAsDataURL(file)
}

function removerFoto() {
  fotoSelecionada.value = null
  previewFoto.value = ''
  form.value.fotoPerfil = ''
  if (inputFoto.value) inputFoto.value.value = ''
}

async function handleSubmit() {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()
  if (!isValid) return

  isLoading.value = true
  try {
    const result = await authService.updatePerfil({
      nome: form.value.nome,
      email: form.value.email,
      ...(form.value.novaSenha && { novaSenha: form.value.novaSenha }),
      foto: fotoSelecionada.value,
    })
    if (result.user?.fotoPerfil) {
      form.value.fotoPerfil = result.user.fotoPerfil
      previewFoto.value = ''
    }
    notification.success('Perfil atualizado com sucesso')
    if (form.value.novaSenha) {
      form.value.novaSenha = ''
      form.value.confirmarSenha = ''
      formRef.value.resetValidation()
    }
    fotoSelecionada.value = null
  } catch (err: any) {
    notification.error(getApiErrorMessage(err, 'Erro ao salvar perfil'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.field-label {
  font-size: 14px;
  color: #7a7a7a;
}
</style>
