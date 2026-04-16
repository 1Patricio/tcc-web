<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Clientes</h4>
        <p class="text-terciary q-my-none">Gerencie seus clientes</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Cliente"
        style="max-width: 200px;"
        :to="{ name: 'cliente-form' }"
      />
    </div>

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-5">
        <q-input
          v-model="filters.term"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por nome ou e-mail..."
          clearable
          clear-icon="close"
        >
          <template #prepend>
            <q-icon name="search" size="18px" />
          </template>
        </q-input>
      </div>

      <div class="col-6 col-md-3">
        <q-select
          v-model="filters.tipoCliente"
          outlined
          dense
          bg-color="white"
          label="Tipo de Cliente"
          clearable
          emit-value
          map-options
          :options="tipoClienteOptions"
        />
      </div>
    </div>
  </div>

  <div class="q-pa-md q-pt-none">
    <div v-if="isLoading" class="column items-center q-gutter-y-md q-pa-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando clientes...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="clientes"
        :columns="columns"
        row-key="id"
        :hide-bottom="clientes.length > 0"
        @row-click="(_, row) => onEditarCliente(row)"
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

        <template #body-cell-email="props">
          <q-td :props="props">
            <span class="text-grey-7">{{ props.row.email }}</span>
          </q-td>
        </template>

        <template #body-cell-tipoCliente="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.tipoCliente === 'PESSOA_JURIDICA' ? 'blue' : 'teal'"
              :label="props.row.tipoCliente === 'PESSOA_JURIDICA' ? 'Pessoa Jurídica' : 'Pessoa Física'"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum cliente encontrado.
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
import { ref, reactive, watch, onMounted } from 'vue'
import { debounce, type QTableColumn } from 'quasar'
import { useClienteService } from '@/services'
import type { Cliente } from '@/types/clientes/Cliente'
import { useRouter } from 'vue-router'

const clienteService = useClienteService()
const router = useRouter()

const clientes = ref<Cliente[]>([])
const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const filters = reactive({
  term: '',
  tipoCliente: null as string | null,
})

const tipoClienteOptions = [
  { label: 'Pessoa Física',   value: 'PESSOA_FISICA' },
  { label: 'Pessoa Jurídica', value: 'PESSOA_JURIDICA' },
]

const columns: QTableColumn[] = [
  { name: 'nome',        field: 'nome',        label: 'Nome',           align: 'left', sortable: true },
  { name: 'email',       field: 'email',       label: 'E-mail',         align: 'left' },
  { name: 'tipoCliente', field: 'tipoCliente', label: 'Tipo de Cliente', align: 'left' },
]

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
    ...(filters.tipoCliente && { tipoCliente: filters.tipoCliente }),
  }
}

async function load() {
  isLoading.value = true
  try {
    const response = await clienteService.getAll({ page: 1, rpp, ...activeFilters() })
    clientes.value = response.list
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
    const response = await clienteService.getAll({ page: page.value, rpp, ...activeFilters() })
    clientes.value = clientes.value.concat(response.list)
    more.value = response.more
    done()
  } catch (error) {
    console.error(error)
    done(true)
  }
}

watch(filters, debounce(refresh, 500), { deep: true })

onMounted(() => {
  load()
})

function onEditarCliente(cliente: Cliente | null) {
  if (!cliente) return
  router.push({ name: 'cliente-view', params: { id: cliente.id } })
}
</script>
