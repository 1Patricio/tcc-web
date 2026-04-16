<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Documentos</h4>
        <p class="text-terciary q-my-none">Gerencia os documentos dos seus clientes</p>
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col-12 col-md-5">
        <q-input
          v-model="term"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por cliente..."
          clearable
          clear-icon="close"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
      </div>
    </div>
  </div>

  <div class="q-pa-md q-pt-none">
    <div v-if="isLoading" class="column items-center q-gutter-y-md q-pa-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando documentos...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
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
              <q-icon name="folder" color="secondary" class="q-mr-sm" size="22px" />
              <span class="text-weight-medium">{{ props.row.nome }}</span>
            </div>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum documento encontrado.
          </div>
        </template>
      </q-table>

      <template #loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce, type QTableColumn } from 'quasar'
import { usePastaService } from '@/services/api/pasta.service'
import type { Pasta } from '@/types/pastas/Pasta'
import { useRouter } from 'vue-router'

const pastaService = usePastaService()
const router = useRouter()

const pastas = ref<Pasta[]>([])
const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20
const term = ref('')

const columns: QTableColumn[] = [
  { name: 'nome',                  field: 'nome',                  label: 'Cliente',                align: 'left', sortable: true },
  { name: 'dataUltimaModificacao', field: 'dataUltimaModificacao', label: 'Última Modificação',     align: 'center' },
]

async function load() {
  isLoading.value = true
  try {
    const response = await pastaService.getAll({
      page: 1,
      rpp,
      ...(term.value.trim() && { term: term.value.trim() }),
    })
    pastas.value = response.list
    more.value = response.more
    page.value = response.page
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function refresh() {
  page.value = 1
  load()
}

async function loadMore(_: number, done: (stop?: boolean) => void) {
  if (!more.value) return done(true)

  try {
    page.value += 1
    const response = await pastaService.getAll({
      page: page.value,
      rpp,
      ...(term.value.trim() && { term: term.value.trim() }),
    })
    pastas.value = pastas.value.concat(response.list)
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

watch(term, debounce(refresh, 500))

onMounted(() => {
  load()
})

function onNavegarPasta(pasta: Pasta) {
  if (!pasta) return
  router.push({ name: 'arquivos', params: { id: pasta.id } })
}
</script>
