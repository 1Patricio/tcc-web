<template>
  <div class="q-pq-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Arquivos</h4>
        <p class="text-terciary q-my-none">Gerencie os arquivos do cliente <span class="text-primary text-bold">{{ cliente?.nome }}</span></p>
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
                :name="'description'"
                :color="'blue-8'"
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
import type { Arquivo } from '@/types/arquivos/Arquivo'
import type { Cliente } from '@/types/clientes/Cliente'
import type { QTableColumn } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const clienteService = useClienteService()
const arquivosService = useArquivoService()
const route = useRoute()

const isLoading = ref(false)
const hasMore = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })
const arquivos = ref<Arquivo[]>([])
const cliente = ref<Cliente>()


onMounted(async () => {
  load()
   const idRota = route.params.id as string

   const response = await arquivosService.getAllByPasta(idRota)
   cliente.value = await clienteService.getById(idRota)
})

const documentos = ref<Arquivo[]>([
  {
    id: '1',
    nome: 'Documento Fictício 1',
    createdAt: isoToBr(new Date().toISOString().split('T')[0])
  },
  {
    id: '2',
    nome: 'Documento Fictício 2',
    createdAt: isoToBr(new Date().toISOString().split('T')[0])
  }
])

function isoToBr(date: string | undefined) {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

console.log(documentos.value)

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


async function load() {
  isLoading.value = true
  try {
    hasMore.value = false 
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
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