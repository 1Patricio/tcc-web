<template>
  <div class="q-pq-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Arquivos</h4>
        <p class="text-terciary q-my-none">
          Gerencie os arquivos do cliente
          <span class="text-primary text-bold">{{ cliente?.nome }}</span>
        </p>
      </div>

      <div>
        <q-btn
          icon="cloud_upload"
          label="Upload Arquivo"
          color="primary"
          no-caps
          class="q-mt-lg"
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
    <q-infinite-scroll 
      v-if="!isLoading"
      @load="loadMore" 
      :offset="250"
    >
      <q-table
        v-model:pagination="tablePagination"
        flat
        bordered
        :rows="documentos"
        :columns="columns"
        row-key="id"
        :hide-bottom="documentos.length > 0"
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
                name="description"
                color="blue-8"
                class="q-mr-sm"
                size="22px"
              />

              <span class="text-weight-medium">
                {{ props.row.nome }}
              </span>

            </div>
          </q-td>
        </template>
      </q-table>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { useClienteService } from '@/services'
import { useArquivoService } from '@/services/api/arquivo.service'
import { usePastaService } from '@/services/api/pasta.service'
import type { Arquivo } from '@/types/arquivos/Arquivo'
import type { Cliente } from '@/types/clientes/Cliente'
import { QFile, type QTableColumn } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const clienteService = useClienteService()
const arquivosService = useArquivoService()
const pastaService = usePastaService()
const route = useRoute()

const idRota = ref('')
const isLoading = ref(false)
const hasMore = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })

const cliente = ref<Cliente | null>(null)
const documentos = ref<Arquivo[]>([])

const file = ref<File | null>(null)
const fileRef = ref<InstanceType<typeof QFile> | null>(null)

const triggerFilePicker = () => {
  fileRef.value?.pickFiles()
}

onMounted(async () => {
  idRota.value = route.params.id as string

  try {
    isLoading.value = true

    const response = await arquivosService.getAllByPasta(idRota.value)
    documentos.value = response

    cliente.value = await clienteService.getById(idRota.value)

  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
})

function isoToBr(date: string | undefined) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

const columns: QTableColumn[] = [
  {
    name: 'nome',
    field: 'nome',
    label: 'Nome',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    field: 'createdAt',
    label: 'Modificação',
    align: 'left',
  },
]

function isValidFile(file: File) {
  const allowed = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  if (!allowed.includes(file.type)) {
    alert('Tipo de arquivo não permitido')
    return false
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('Arquivo muito grande (máx 5MB)')
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

    const result = await arquivosService.upload(idRota.value, selectedFile)

    console.log('Upload realizado:', result)

    // Atualiza lista (otimista)
    documentos.value.unshift({
      id: crypto.randomUUID(),
      nome: selectedFile.name,
      createdAt: isoToBr(new Date().toISOString().split('T')[0])
    } as Arquivo)

  } catch (error) {
    console.error('Erro no upload:', error)
  } finally {
    isLoading.value = false
    file.value = null
  }
}

async function loadMore(index: number, done: (stop?: boolean) => void) {
  if (!hasMore.value) {
    done(true)
    return
  }

  try {
    done(true)
  } catch (error) {
    console.error(error)
    done(true)
  }
}
</script>