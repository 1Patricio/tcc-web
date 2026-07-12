<template>
  <q-dialog
    v-model="model"
    :persistent="isUploading"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card style="width: 100%; max-width: 520px">
      <q-card-section class="row items-center justify-between">
        <span class="text-h6 text-bold text-grey-9">
          {{ titulo }}
        </span>
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          color="grey-8"
          :disable="isUploading"
        />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-list style="max-height: 350px; overflow-y: auto">
          <q-item
            v-for="(item, index) in uploads"
            :key="index"
          >
            <q-item-section avatar>
              <q-icon
                :name="getFileIcon(item.file.name).icon"
                :color="getFileIcon(item.file.name).color"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{ item.file.name }}</q-item-label>
              <q-item-label
                v-if="item.errorMessage"
                caption
                lines="1"
                class="text-red"
              >
                {{ item.errorMessage }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-icon
                v-if="item.success"
                name="check_circle"
                color="green"
                size="1.8em"
              />
              <q-icon
                v-else-if="item.failed"
                name="cancel"
                color="red"
                size="1.8em"
              />
              <q-spinner
                v-else-if="item.isUploading"
                color="primary"
                size="1.8em"
              />
              <q-icon
                v-else
                name="schedule"
                color="grey-5"
                size="1.8em"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useArquivoService } from '@/services/api/arquivo.service'
import type { Arquivo } from '@/types/arquivos/Arquivo'
import { getFileIcon } from '@/utils/fileIcon'

interface UploadItem {
  file: File
  isUploading: boolean
  success: boolean
  failed: boolean
  errorMessage: string | null
}

const props = defineProps<{
  modelValue: boolean
  files: File[]
  pastaId: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'uploaded', arquivos: Arquivo[]): void
}>()

const arquivosService = useArquivoService()

const model = ref(props.modelValue)
watch(
  () => props.modelValue,
  (value) => (model.value = value),
)
watch(model, (value) => emit('update:modelValue', value))

const uploads = ref<UploadItem[]>([])

const isUploading = computed(() =>
  uploads.value.some((upload) => !upload.success && !upload.failed),
)

const titulo = computed(() => {
  const pendentes = uploads.value.filter((upload) => !upload.success && !upload.failed).length
  if (pendentes > 0) {
    return `Enviando ${pendentes} ${pendentes === 1 ? 'arquivo' : 'arquivos'}...`
  }
  const enviados = uploads.value.filter((upload) => upload.success).length
  return `${enviados} ${enviados === 1 ? 'upload concluído' : 'uploads concluídos'}`
})

watch(model, (open) => {
  if (open) startUploads()
})

async function startUploads() {
  uploads.value = [...props.files]
    .sort((arquivoA, arquivoB) => arquivoA.size - arquivoB.size)
    .map((file) => ({
      file,
      isUploading: false,
      success: false,
      failed: false,
      errorMessage: null,
    }))

  const criados: Arquivo[] = []

  for (const item of uploads.value) {
    item.isUploading = true
    try {
      const criado = await arquivosService.upload(props.pastaId, item.file)
      criados.push(criado)
      item.success = true
    } catch (err) {
      console.error('Erro no upload:', err)
      item.failed = true
      item.errorMessage = 'Erro ao enviar o arquivo.'
    } finally {
      item.isUploading = false
    }
  }

  if (criados.length) emit('uploaded', criados)

  if (!uploads.value.some((upload) => upload.failed)) {
    setTimeout(() => (model.value = false), 1000)
  }
}
</script>
