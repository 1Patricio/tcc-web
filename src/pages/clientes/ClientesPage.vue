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
        :rows="clientes"
        :columns="columns"
        :loading="isLoading"
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

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum cliente encontrado.
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
      <span class="text-grey-8">Carregando clientes...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type QTableColumn } from 'quasar'
import { useClienteService } from '@/services'
import type { Cliente } from '@/types/clientes/Cliente'
import { useRouter } from 'vue-router'

const clienteService = useClienteService()
const router = useRouter()

const clientes = ref<Cliente[]>([])
const isLoading = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })

// const page = ref(1)
// const rpp = 20
const hasMore = ref(true)

const columns: QTableColumn[] = [
  {
    name: 'nome',
    field: 'nome',
    label: 'Nome',
    align: 'left',
    sortable: true,
  },
  {
    name: 'email',
    field: 'email',
    label: 'E-mail',
    align: 'left',
  },
]

async function loadClientes() {
  isLoading.value = true
  try {
    // const response = await clienteService.getAll({ page: 1, rpp })
    // clientes.value = response.list
    // hasMore.value = response.list.length === rpp

    const response = await clienteService.getAll()
    clientes.value = response
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

onMounted(() => {
  loadClientes()
})

function onEditarCliente(cliente: Cliente | null) {
  if (!cliente) return

  router.push({
    name: 'cliente-view',
    params: {id: cliente.id}
  })
}
</script>