<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Usuários</h4>
        <p class="text-terciary q-my-none">Gerencie os usuários do seu escritório</p>
      </div>
      <q-btn
        color="secondary"
        icon="add_circle"
        label="Novo Usuário"
        style="max-width: 200px;"
        :to="{ name: 'configuracoes-usuarios-novo' }"
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
    </div>
  </div>

  <div class="q-pa-md q-pt-none">
    <div v-if="isLoading" class="column items-center q-gutter-y-md q-pa-xl">
      <q-spinner-hourglass color="primary" size="4em" />
      <span class="text-grey-8">Carregando usuários...</span>
    </div>

    <q-infinite-scroll
      v-else
      :offset="250"
      @load="loadMore"
    >
      <q-table
        flat
        bordered
        :rows="usuarios"
        :columns="columns"
        row-key="id"
        :hide-bottom="usuarios.length > 0"
        @row-click="(_, row) => onEditarUsuario(row)"
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

        <template #body-cell-ativo="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.ativo ? 'green' : 'grey'"
              :label="props.row.ativo ? 'Ativo' : 'Inativo'"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width flex flex-center q-pa-md text-grey-6">
            Nenhum usuário encontrado.
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
import { useUsuarioService } from '@/services'
import type { Usuario } from '@/types/usuarios/Usuario'
import { useRouter } from 'vue-router'

const usuarioService = useUsuarioService()
const router = useRouter()

const usuarios = ref<Usuario[]>([])
const isLoading = ref(true)
const more = ref(false)
const page = ref(1)
const rpp = 20

const filters = reactive({
  term: '',
})

const columns: QTableColumn[] = [
  { name: 'nome',  field: 'nome',  label: 'Nome',    align: 'left', sortable: true },
  { name: 'email', field: 'email', label: 'E-mail',  align: 'left' },
  { name: 'ativo', field: 'ativo', label: 'Status',  align: 'left' },
]

function activeFilters() {
  return {
    ...(filters.term?.trim() && { term: filters.term.trim() }),
  }
}

async function load() {
  isLoading.value = true
  try {
    const response = await usuarioService.getAll({ page: 1, rpp, ...activeFilters() })
    usuarios.value = response.list
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
    const response = await usuarioService.getAll({ page: page.value, rpp, ...activeFilters() })
    usuarios.value = usuarios.value.concat(response.list)
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

function onEditarUsuario(usuario: Usuario | null) {
  if (!usuario) return
  router.push({ name: 'configuracoes-usuarios-editar', params: { id: usuario.id } })
}
</script>
