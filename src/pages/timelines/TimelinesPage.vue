<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Timeline</h4>
        <p class="text-terciary q-my-none">Faça acompanhamento de processo dos seus clientes</p>
      </div>
    </div>
  </div>

  <div class="q-pa-md">
    <q-input
      v-model="filtro"
      class="q-mb-md bg-white"
      placeholder="Buscar..."
      style="max-width: 400px;"
      outlined
      dense
      clearable
      hide-bottom-space
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      flat
      bordered
      :rows="clientesFiltrados"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :hide-bottom="clientesFiltrados.length > 0"
      @row-click=""
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

      <template #loading>
        <div class="column items-center q-gutter-y-md q-pa-xl full-width">
          <q-spinner-hourglass color="primary" size="4em" />
          <span class="text-grey-8">Carregando clientes...</span>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { useClienteService } from '@/services';
import type { Cliente } from '@/types/clientes/Cliente';
import type { QTableColumn } from 'quasar';
import { computed, onMounted, ref } from 'vue';

const clienteService = useClienteService()

const loading = ref(false)
const clientes = ref<Cliente[]>([])
const filtro = ref('')

const clientesFiltrados = computed(() => {
  if (!filtro.value) return clientes.value
  const termo = filtro.value.toLowerCase()
  return clientes.value.filter(c =>
    c.nome?.toLowerCase().includes(termo) ||
    c.email?.toLowerCase().includes(termo)
  )
})

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
  loading.value = true
  try {
    const response = await clienteService.getAll()
    clientes.value = response
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadClientes()
})
</script>