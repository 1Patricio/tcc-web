<template>
  <div class="q-pa-md">
    <div
      class="flex justify-between items-center q-mb-sm"
      style="height: 80px"
    >
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Timelines</h4>
        <p class="text-terciary q-my-none">
          Acompanhamento de processos por cliente
        </p>
      </div>
    </div>

    <q-input
      v-model="filtro"
      class="q-mb-lg bg-white"
      placeholder="Buscar por número do processo..."
      style="max-width: 400px"
      outlined
      dense
      clearable
      hide-bottom-space
      clear-icon="close"
    >
      <template #prepend>
        <q-icon
          name="search"
          size="18px"
        />
      </template>
    </q-input>

    <div
      v-if="loading"
      class="column items-center q-gutter-y-md q-pa-xl"
    >
      <q-spinner-hourglass
        color="primary"
        size="4em"
      />
      <span class="text-grey-8">Carregando...</span>
    </div>

    <div
      v-else-if="processosFiltrados.length === 0"
      class="column items-center q-pa-xl text-grey-5"
    >
      <q-icon
        name="timeline"
        size="4em"
      />
      <p class="q-mt-md">Nenhum processo encontrado.</p>
    </div>

    <!-- Cards -->
    <div
      v-else
      class="row q-col-gutter-md"
    >
      <div
        v-for="item in processosFiltrados"
        :key="item.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div
          class="processo-card cursor-pointer"
          @click="irParaTimeline(item.id)"
        >
          <!-- Cabeçalho do card -->
          <div class="processo-card__header">
            <div class="row items-start justify-between no-wrap">
              <div class="col">
                <p
                  class="text-caption text-grey-5 q-mb-xs"
                  style="text-transform: uppercase; letter-spacing: 0.06em"
                >
                  {{ tipoLabel(item.tipoAcaoProcesso) }}
                </p>
                <div
                  class="text-subtitle1 text-weight-bold text-grey-9 processo-numero"
                >
                  {{ item.numeroProcesso }}
                </div>
                <div
                  v-if="item.parteContraria"
                  class="text-caption text-grey-6 q-mt-xs"
                >
                  vs. {{ item.parteContraria }}
                </div>
              </div>
              <span
                class="status-label q-ml-sm"
                :class="`status-label--${item.status.toLowerCase()}`"
              >
                {{ statusLabel(item.status) }}
              </span>
            </div>
          </div>

          <q-separator />

          <!-- Último evento -->
          <div class="processo-card__body">
            <div
              v-if="item.ultimoEvento"
              class="row items-start q-gutter-x-sm"
            >
              <q-icon
                :name="tipoIcon(item.ultimoEvento.tipo)"
                size="18px"
                color="grey-5"
                class="q-mt-xs"
              />
              <div class="col">
                <p class="text-caption text-grey-5 q-mb-xs">Último evento</p>
                <p class="text-body2 text-grey-8 q-mb-xs ellipsis">
                  {{ item.ultimoEvento.titulo }}
                </p>
                <p class="text-caption text-grey-5 q-mb-none">
                  {{ formatarDataAbreviada(item.ultimoEvento.data) }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="row items-center q-gutter-x-sm text-grey-4"
            >
              <q-icon
                name="add_circle_outline"
                size="18px"
              />
              <span class="text-caption">Nenhum evento registrado ainda</span>
            </div>
          </div>

          <div class="processo-card__footer row items-center justify-between">
            <div class="row items-center q-gutter-x-xs">
              <q-icon
                name="timeline"
                size="16px"
                color="grey-5"
              />
              <span class="text-caption text-grey-6">
                {{ totalEventosLabel(item.totalEventos) }}
              </span>
            </div>
            <q-btn
              flat
              round
              dense
              size="sm"
              icon="share"
              color="grey-6"
              @click.stop="copiarLink(item.id)"
            >
              <q-tooltip>Copiar link para o cliente</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTimelineService } from '@/services'
import { useNotification } from '@/composables/useNotification'
import type { TimelineResumo } from '@/types/timelines/TimelineEvento'
import { formatarDataAbreviada } from '@/utils/date'

const timelineService = useTimelineService()
const notification = useNotification()
const router = useRouter()

const loading = ref(false)
const processos = ref<TimelineResumo[]>([])
const filtro = ref('')

const processosFiltrados = computed(() => {
  if (!filtro.value) return processos.value
  const termo = filtro.value.toLowerCase()
  return processos.value.filter((processo) =>
    processo.numeroProcesso.toLowerCase().includes(termo),
  )
})

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ANDAMENTO: 'Andamento',
    JULGAMENTO: 'Julgamento',
    SENTENCA: 'Sentença',
    RECURSO: 'Recurso',
    ARQUIVADO: 'Arquivado',
  }
  return map[status] ?? status
}

function tipoLabel(tipo: string) {
  const map: Record<string, string> = {
    CIVEL: 'Cível',
    TRABALHISTA: 'Trabalhista',
    CRIMINAL: 'Criminal',
    TRIBUTARIO: 'Tributário',
    FAMILIA: 'Família',
    CONSUMIDOR: 'Consumidor',
    OUTROS: 'Outros',
  }
  return map[tipo] ?? tipo
}

function tipoIcon(tipo: string) {
  const map: Record<string, string> = {
    AUDIENCIA: 'gavel',
    SENTENCA: 'balance',
    RECURSO: 'upload',
    DESPACHO: 'assignment',
    PROTOCOLO: 'inventory',
    PERICIA: 'science',
    ACORDO: 'handshake',
    OUTROS: 'info',
  }
  return map[tipo] ?? 'info'
}

function totalEventosLabel(total: number) {
  if (total === 0) return 'Sem eventos'
  if (total === 1) return '1 evento'
  return `${total} eventos`
}

function irParaTimeline(processoId: string) {
  router.push({ name: 'timeline-gestao', params: { processoId } })
}

async function copiarLink(processoId: string) {
  const { href } = router.resolve({ name: 'timeline-publica', params: { processoId } })
  const url = `${window.location.origin}${href}`
  try {
    await navigator.clipboard.writeText(url)
    notification.success(
      'Link copiado! Envie ao cliente — a senha são os 4 últimos dígitos do processo.',
    )
  } catch {
    notification.error('Não foi possível copiar o link.')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    processos.value = await timelineService.resumo()
  } catch {
    notification.error('Erro ao carregar processos.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.processo-card {
  background: #ffffff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.processo-card:hover {
  border-color: #bdbdbd;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.processo-card__header {
  padding: 20px 20px 16px;
}

.processo-card__body {
  padding: 14px 20px;
  flex: 1;
}

.processo-card__footer {
  padding: 10px 16px 10px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.processo-numero {
  font-size: 14px;
  word-break: break-all;
}

/* Status */
.status-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
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
}
.status-label--arquivado {
  color: #757575;
}
</style>
