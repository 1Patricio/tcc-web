<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-lg"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Home</h4>
        <p class="text-terciary text-bold q-my-none">
          Bem vindo ao <span class="text-primary">INTERM</span>
        </p>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando painel...</span>
    </div>

    <template v-else>
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="card in statsCards"
          :key="card.value"
          class="col-6 col-sm-4 col-md-2"
        >
          <div class="stat-card">
            <div
              class="stat-card__icon-wrapper"
              :style="{ background: `${card.color}1A` }"
            >
              <q-icon
                :name="card.icon"
                size="22px"
                :style="{ color: card.color }"
              />
            </div>
            <div
              class="stat-card__number"
              :style="{ color: card.color }"
            >
              {{ card.total }}
            </div>
            <div class="stat-card__label">{{ card.label }}</div>
          </div>
        </div>
      </div>

      <div class="deadlines-card">
        <div class="deadlines-card__header">
          <div class="deadlines-card__icon-wrapper">
            <q-icon
              name="schedule"
              size="20px"
              style="color: #616161"
            />
          </div>
          <span class="deadlines-card__title"
            >Processos com prazos mais próximos</span
          >
        </div>

        <div
          v-if="proximosPrazos.length === 0"
          class="text-grey-6 q-pa-lg text-center"
        >
          Nenhum processo com prazo registrado.
        </div>

        <q-table
          v-else
          flat
          :rows="proximosPrazos"
          :columns="columns"
          row-key="id"
          hide-bottom
          class="deadlines-table"
          @row-click="(_, row) => irParaProcesso(row)"
        >
          <template #header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="bg-grey-1 text-grey-7"
                style="font-weight: 600"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template #body-cell-prazo="props">
            <q-td :props="props">
              <span
                class="prazo-date"
                :class="prazoClass(props.row.dataPrazo)"
              >
                {{ formatDate(props.row.dataPrazo) }}
              </span>
              <span class="prazo-hint text-grey-6 q-ml-sm">
                {{ prazoLabel(props.row.dataPrazo) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <span
                class="status-label"
                :class="`status-label--${props.row.status.toLowerCase()}`"
              >
                {{ formatStatus(props.row.status) }}
              </span>
            </q-td>
          </template>

          <template #body-cell-tipo="props">
            <q-td :props="props">
              <span class="text-grey-8">{{
                formatTipo(props.row.tipoAcaoProcesso)
              }}</span>
            </q-td>
          </template>
        </q-table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { type QTableColumn } from 'quasar'
import { useProcessoService } from '@/services'

const router = useRouter()
const processoService = useProcessoService()

const isLoading = ref(true)
const stats = ref<{ status: string; total: number }[]>([])
const proximosPrazos = ref<any[]>([])

const statusOptions = [
  { label: 'Andamento', value: 'ANDAMENTO', color: '#003366', icon: 'gavel' },
  {
    label: 'Julgamento',
    value: 'JULGAMENTO',
    color: '#C6A75E',
    icon: 'balance',
  },
  {
    label: 'Sentença',
    value: 'SENTENCA',
    color: '#8B5E3C',
    icon: 'description',
  },
  { label: 'Recurso', value: 'RECURSO', color: '#C10015', icon: 'replay' },
  { label: 'Arquivado', value: 'ARQUIVADO', color: '#757575', icon: 'archive' },
]

const tipoOptions = [
  { label: 'Cível', value: 'CIVEL' },
  { label: 'Trabalhista', value: 'TRABALHISTA' },
  { label: 'Criminal', value: 'CRIMINAL' },
  { label: 'Tributário', value: 'TRIBUTARIO' },
  { label: 'Família', value: 'FAMILIA' },
  { label: 'Consumidor', value: 'CONSUMIDOR' },
  { label: 'Outros', value: 'OUTROS' },
]

const statsCards = computed(() =>
  statusOptions.map((opt) => ({
    ...opt,
    total: stats.value.find((s) => s.status === opt.value)?.total ?? 0,
  })),
)

const columns: QTableColumn[] = [
  {
    name: 'numeroProcesso',
    field: 'numeroProcesso',
    label: 'Número Processo',
    align: 'left',
  },
  {
    name: 'tipo',
    field: 'tipoAcaoProcesso',
    label: 'Tipo Ação',
    align: 'left',
  },
  {
    name: 'parteContraria',
    field: 'parteContraria',
    label: 'Parte Contrária',
    align: 'left',
    format: (val: string) => val || '-',
  },
  { name: 'status', field: 'status', label: 'Status', align: 'left' },
  { name: 'prazo', field: 'dataPrazo', label: 'Prazo', align: 'left' },
]

async function load() {
  try {
    const data = await processoService.getDashboard()
    stats.value = data.stats
    proximosPrazos.value = data.proximosPrazos
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function irParaProcesso(processo: any) {
  router.push({ name: 'processo-view', params: { id: processo.id } })
}

function formatDate(val: string): string {
  if (!val) return '-'
  const date = new Date(val)
  return date.toLocaleDateString('pt-BR')
}

function diasRestantes(val: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const prazo = new Date(val)
  prazo.setHours(0, 0, 0, 0)
  return Math.round((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function prazoClass(val: string): string {
  if (!val) return 'prazo-date--ok'
  const dias = diasRestantes(val)
  if (dias < 0) return 'prazo-date--vencido'
  if (dias <= 7) return 'prazo-date--urgente'
  if (dias <= 15) return 'prazo-date--atencao'
  return 'prazo-date--ok'
}

function prazoLabel(val: string): string {
  if (!val) return ''
  const dias = diasRestantes(val)
  if (dias < 0) return `venceu há ${Math.abs(dias)} dia(s)`
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  return `${dias} dias`
}

function formatStatus(val: string): string {
  return statusOptions.find((o) => o.value === val)?.label ?? val
}

function formatTipo(val: string): string {
  return tipoOptions.find((o) => o.value === val)?.label ?? val
}

onMounted(() => load())
</script>

<style scoped>
/* ── Stat cards ── */
.stat-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: #bdbdbd;
}

.stat-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}

.stat-card__number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.stat-card__label {
  font-size: 13px;
  color: #757575;
  font-variant: small-caps;
  text-transform: lowercase;
}

/* ── Deadlines card ── */
.deadlines-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
}

.deadlines-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.deadlines-card__icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #6161611a;
}

.deadlines-card__title {
  font-size: 15px;
  font-weight: 600;
  color: #424242;
}

/* ── Table ── */
.deadlines-table {
  cursor: pointer;
}

/* ── Prazo ── */
.prazo-date {
  font-weight: 600;
  font-size: 13px;
}

.prazo-date--vencido {
  color: #c10015;
}
.prazo-date--urgente {
  color: #c10015;
}
.prazo-date--atencao {
  color: #c6a75e;
}
.prazo-date--ok {
  color: #424242;
}

.prazo-hint {
  font-size: 12px;
}

/* ── Status label ── */
.status-label {
  font-size: 13px;
  font-weight: 500;
}

.status-label--andamento {
  color: #003366;
}
.status-label--julgamento {
  color: #c6a75e;
}
.status-label--sentenca {
  color: #8b5e3c;
}
.status-label--recurso {
  color: #c10015;
  font-weight: 600;
}
.status-label--arquivado {
  color: #757575;
}
</style>
