<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Petições</h4>
        <p class="text-terciary q-my-none">Gerencie seus modelos de petições</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Modelo"
        style="max-width: 200px;"
        :to="{ name: 'peticoes-form' }"
      />
    </div>
  </div>

  <div class="q-pa-md">
    <q-infinite-scroll
      v-if="!isLoading"
      :offset="250"
      @load="loadMore"
    >
      <q-table
        v-model:pagination="tablePagination"
        flat
        bordered
        :rows="peticoes"
        :columns="columns"
        :loading="isLoading"
        row-key="id"
        :hide-bottom="peticoes.length > 0"
        @row-click="(_, row) => onEditarPeticao(row)"
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
            <span class="text-weight-medium text-grey-9">{{ props.row.nome }}</span>
          </q-td>
        </template>

        <template #body-cell-tipo="props">
          <q-td :props="props">
            <span class="text-grey-7">{{ formatTipo(props.row.tipo) }}</span>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum modelo encontrado.
          </div>
        </template>

        <template #bottom>
          <div class="row full-width" />
        </template>
      </q-table>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>

    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando modelos...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type QTableColumn } from 'quasar'
import { useRouter } from 'vue-router'
import type { PeticaoModelo } from '@/types/peticoes/PeticaoModelo'
import { usePeticaoService } from '@/services/api/peticao.service'

const router = useRouter()
const peticaoService = usePeticaoService()

const peticoes = ref<PeticaoModelo[]>([])
const isLoading = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })
const hasMore = ref(true)

const columns: QTableColumn[] = [
  {
    name: 'nome',
    field: 'nome',
    label: 'Nome do Modelo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tipo',
    field: 'tipo',
    label: 'Tipo',
    align: 'left',
  },
]

async function loadPeticoes() {
  isLoading.value = true
  try {
    peticoes.value = await peticaoService.getAll()
    hasMore.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

async function loadMore(_index: number, done: (stop?: boolean) => void) {
  if (!hasMore.value) {
    done(true)
    return
  }
  done(true)
}

onMounted(() => {
  loadPeticoes()
})

function onEditarPeticao(peticao: PeticaoModelo | null) {
  if (!peticao) return
  router.push({
    name: 'peticao-view',
    params: { id: peticao.id },
  })
}

function formatTipo(tipo: string) {
  const map: Record<string, string> = {
    INICIAL: 'Inicial',
    CONTESTACAO: 'Contestação',
    RECURSO: 'Recurso',
    AGRAVO: 'Agravo',
    OUTROS: 'Outros',
  }
  return map[tipo] ?? tipo
}
</script>
