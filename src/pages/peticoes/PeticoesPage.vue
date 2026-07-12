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

    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="busca"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por nome ou tipo..."
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
        :rows="peticoesFiltradas"
        :columns="columns"
        :loading="isLoading"
        row-key="id"
        :hide-bottom="peticoesFiltradas.length > 0"
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

        <template #body="props">
          <q-tr
            :props="props"
            style="cursor: pointer"
            @click="onEditarPeticao(props.row)"
          >
            <q-td
              key="nome"
              :props="props"
            >
              <span class="text-weight-medium text-grey-9">{{ props.row.nome }}</span>
            </q-td>

            <q-td
              key="tipo"
              :props="props"
            >
              <span class="text-grey-7">{{ formatTipo(props.row.tipo) }}</span>
            </q-td>

            <MenuPeticao
              :copy-item="!!props.row.conteudo"
              @on-copy="copiarConteudo(props.row)"
              @on-delete="confirmarExclusao(props.row)"
            />
          </q-tr>
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar, type QTableColumn } from 'quasar'
import { useRouter } from 'vue-router'
import MenuPeticao from '@/components/peticoes/MenuPeticao.vue'
import type { PeticaoModelo } from '@/types/peticoes/PeticaoModelo'
import { usePeticaoService } from '@/services/api/peticao.service'
import { useNotification } from '@/composables/useNotification'
import { copiarConteudoFormatado } from '@/utils/copiarConteudo'

const router = useRouter()
const peticaoService = usePeticaoService()
const $q = useQuasar()
const { success, error } = useNotification()

const peticoes = ref<PeticaoModelo[]>([])
const isLoading = ref(true)
const tablePagination = ref({ rowsPerPage: 0 })
const hasMore = ref(true)
const busca = ref('')

const peticoesFiltradas = computed(() => {
  const termo = busca.value?.trim().toLowerCase()
  if (!termo) return peticoes.value
  return peticoes.value.filter(
    (peticao) =>
      peticao.nome.toLowerCase().includes(termo) ||
      formatTipo(peticao.tipo).toLowerCase().includes(termo),
  )
})

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

async function copiarConteudo(peticao: PeticaoModelo) {
  if (!peticao.conteudo?.trim()) return
  try {
    await copiarConteudoFormatado(peticao.conteudo)
    success('Conteúdo copiado (formatação preservada para Docs/Word)!')
  } catch {
    error('Falha ao copiar o conteúdo.')
  }
}

function confirmarExclusao(peticao: PeticaoModelo) {
  $q.dialog({
    title: 'Excluir modelo',
    message: `Deseja excluir "${peticao.nome}"? Esta ação não pode ser desfeita.`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Excluir', color: 'red' },
    persistent: true,
  }).onOk(async () => {
    if (!peticao.id) return
    try {
      await peticaoService.remove(peticao.id)
      peticoes.value = peticoes.value.filter(
        (modelo) => modelo.id !== peticao.id,
      )
      success('Modelo excluído com sucesso.')
    } catch {
      error('Erro ao excluir modelo.')
    }
  })
}
</script>
