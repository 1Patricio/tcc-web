<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <span
            class="text-grey-6 cursor-pointer text-sm"
            @click="router.push({ name: 'pastas' })"
          >
            Documentos
          </span>
          <template v-for="(crumb, i) in breadcrumbs" :key="crumb.id">
            <q-icon name="chevron_right" size="16px" color="grey-5" />
            <span
              :class="i === breadcrumbs.length - 1 ? 'text-primary text-bold text-sm' : 'text-grey-6 cursor-pointer text-sm'"
              @click="i < breadcrumbs.length - 1 && router.push({ name: 'arquivos', params: { id: crumb.id } })"
            >
              {{ crumb.nome }}
            </span>
          </template>
        </div>
        <h4 class="text-terciary text-bold q-my-none">{{ pasta?.nome ?? 'Arquivos' }}</h4>
      </div>

      <div>
        <q-btn
          icon="cloud_upload"
          label="Upload Arquivo"
          color="primary"
          no-caps
          :loading="isLoading"
          @click="triggerFilePicker"
        />

        <q-file
          ref="fileRef"
          v-model="file"
          style="display: none"
          @update:model-value="onFileSelected"
        />
      </div>
    </div>
  </div>

  <div class="q-pa-md">
    <div v-if="isLoading" class="column items-center q-gutter-y-md q-pa-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando...</span>
    </div>

    <q-infinite-scroll
      v-else
      @load="loadMore"
      :offset="250"
    >
      <q-table
        flat
        bordered
        :rows="documentos"
        :columns="columns"
        row-key="id"
        :hide-bottom="documentos.length > 0"
        @row-click="(_evt, row) => onRowClick(row)"
        style="cursor: pointer"
      >
        <template #header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="bg-grey-2 text-grey-8"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-nome="props">
          <q-td :props="props">
            <div class="row items-center">
              <q-icon
                :name="props.row._type === 'pasta' ? 'folder' : getFileIcon(props.row.nome).icon"
                :color="props.row._type === 'pasta' ? 'secondary' : getFileIcon(props.row.nome).color"
                class="q-mr-sm"
                size="22px"
              />
              <span class="text-weight-medium">{{ props.row.nome }}</span>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum arquivo encontrado.
          </div>
        </template>
      </q-table>
    </q-infinite-scroll>
  </div>

  <PdfViewerDialog
    v-model="pdfDialog"
    :arquivo="selectedArquivo"
    :pdf-data="pdfData"
    :loading="pdfLoading"
  />
</template>

<script setup lang="ts">
import PdfViewerDialog from '@/components/documentos/PdfViewerDialog.vue'
import { useArquivoService } from '@/services/api/arquivo.service'
import { usePastaService } from '@/services/api/pasta.service'
import type { Arquivo } from '@/types/arquivos/Arquivo'
import { QFile, type QTableColumn } from 'quasar'
import { onMounted, ref, watch } from 'vue'
import { useNotification } from '@/composables/useNotification'
import { useRoute, useRouter } from 'vue-router'
import { getFileIcon } from '@/utils/fileIcon'

const arquivosService = useArquivoService()
const pastaService = usePastaService()
const route = useRoute()
const router = useRouter()
const { warning } = useNotification()

const isLoading = ref(false)
const hasMore = ref(false)

const pasta = ref<any>(null)
const breadcrumbs = ref<{ id: string, nome: string }[]>([])
const documentos = ref<any[]>([])

const file = ref<File | null>(null)
const fileRef = ref<InstanceType<typeof QFile> | null>(null)

const pdfDialog = ref(false)
const pdfLoading = ref(false)
const pdfData = ref<ArrayBuffer | null>(null)
const selectedArquivo = ref<Arquivo | null>(null)

const triggerFilePicker = () => fileRef.value?.pickFiles()

async function carregar(id: string) {
  try {
    isLoading.value = true

    const [pastaData, arquivos] = await Promise.all([
      pastaService.getById(id),
      arquivosService.getAllByPasta(id),
    ])

    pasta.value = pastaData

    breadcrumbs.value = buildBreadcrumbs(pastaData)

    const subpastas = (pastaData.subpastas ?? []).map((p: any) => ({ ...p, _type: 'pasta' }))
    const files = (arquivos ?? []).map((a: any) => ({ ...a, _type: 'arquivo' }))
    documentos.value = [...subpastas, ...files]

  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function buildBreadcrumbs(p: any): { id: string, nome: string }[] {
  const crumbs: { id: string, nome: string }[] = []
  let current = p
  while (current) {
    crumbs.unshift({ id: current.id, nome: current.nome })
    current = current.parent ?? null
  }
  return crumbs
}

onMounted(() => carregar(route.params.id as string))

watch(() => route.params.id, (id) => {
  if (id) carregar(id as string)
})

function isoToBr(date: string | undefined) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

const columns: QTableColumn[] = [
  { name: 'nome',      field: 'nome',      label: 'Nome',        align: 'left', sortable: true },
  { name: 'createdAt', field: 'createdAt', label: 'Modificação',  align: 'left' },
]

function isValidFile(file: File) {
  const allowed = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'text/plain',
  ]

  if (!allowed.includes(file.type)) {
    warning('Tipo de arquivo não permitido. Use PDF, imagem, Word ou Excel.')
    return false
  }

  if (file.size > 50 * 1024 * 1024) {
    warning('Arquivo muito grande. O limite é 50MB.')
    return false
  }

  return true
}

async function onFileSelected(selectedFile: File | null) {
  if (!selectedFile || !isValidFile(selectedFile)) {
    file.value = null
    return
  }

  try {
    isLoading.value = true
    await arquivosService.upload(route.params.id as string, selectedFile)
    await carregar(route.params.id as string)
  } catch (error) {
    console.error('Erro no upload:', error)
  } finally {
    isLoading.value = false
    file.value = null
  }
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  done(true)
}

async function onRowClick(row: any) {
  if (row._type === 'pasta') {
    router.push({ name: 'arquivos', params: { id: row.id } })
    return
  }

  const arquivo = row as Arquivo
  const isPdf = arquivo.nome.toLowerCase().endsWith('.pdf')

  if (isPdf) {
    selectedArquivo.value = arquivo
    pdfData.value = null
    pdfDialog.value = true
    pdfLoading.value = true

    try {
      pdfData.value = await arquivosService.download(arquivo.id)
    } catch (error) {
      console.error('Erro ao carregar PDF:', error)
    } finally {
      pdfLoading.value = false
    }
    return
  }

  try {
    const url = await arquivosService.getPresignedUrl(arquivo.id)
    window.open(url, '_blank')
  } catch (error) {
    console.error('Erro ao abrir arquivo:', error)
  }
}
</script>
