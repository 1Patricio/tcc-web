<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Documentos</h4>
        <p class="text-terciary q-my-none">Gerencia os documentos dos seus clientes</p>
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
        :rows="pastas"
        :columns="columns"
        row-key="id"
        :hide-bottom="pastas.length > 0"
        @row-click="(_, row) => onNavegarPasta(row)"
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
                :name="'folder'"
                :color="'secondary'"
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
import { usePastaService } from '@/services/api/pasta.service'
import type { Pasta } from '@/types/pastas/Pasta'
import type { QTableColumn } from 'quasar'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const pastaService = usePastaService()
const router = useRouter()

const isLoading = ref(false)
const hasMore = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })
const pastas = ref<Pasta[]>([])

onMounted(async () => {
   load()
   const response = await pastaService.getAll()
   pastas.value = response
})

const columns: QTableColumn[] = [
  {
    name: 'nome',
    field: 'nome',
    label: 'Clientes',
    align: 'left',
    sortable: true,
  },
  {
    name: 'dataUltimaModificacao',
    field: 'dataUltimaModificacao',
    label: 'Data Última Modificação',
    align: 'center',
  },
]


async function load() {
  isLoading.value = true
  try {
    // const response = await clienteService.getAll({ page: 1, rpp })
    // clientes.value = response.list
    // hasMore.value = response.list.length === rpp

    // const response = await clienteService.getAll()
    // clientes.value = response
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
    //page.value++
    // const response = await clienteService.getAll({ page: page.value, rpp })
    // clientes.value.push(...response.list)
    // const stop = response.list.length < rpp
    // done(stop)

    done(true)
  } catch (error) {
    console.error(error)
    done(true)
  }
}

async function onNavegarPasta(pasta: any) {
  if(!pasta) return
  
  router.push({
    name: 'arquivos', 
    params: {id: pasta.id}
  })
}
</script>