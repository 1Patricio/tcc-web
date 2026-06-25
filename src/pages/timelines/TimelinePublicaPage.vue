<template>
  <q-page class="bg-grey-2">
    <div
      v-if="!autenticado"
      class="pin-wrapper"
    >
      <q-card class="pin-card">
        <q-card-section class="text-center">
          <q-icon
            name="balance"
            size="3em"
            color="primary"
          />
          <div class="text-h6 text-weight-bold q-mt-sm">
            Acompanhamento de Processo
          </div>
          <p class="text-grey-6 text-body2 q-mt-xs q-mb-none">
            Digite os <strong>4 últimos dígitos</strong> do número do processo
            para acessar o histórico.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="autenticar">
            <q-input
              v-model="pin"
              label="Últimos 4 dígitos"
              outlined
              dense
              maxlength="4"
              inputmode="numeric"
              autofocus
              :error="!!erroPIN"
              :error-message="erroPIN"
              class="q-mb-md"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Acessar"
              class="full-width"
              :loading="carregando"
              unelevated
            />
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <div
      v-else
      class="timeline-wrapper q-px-lg q-py-md"
    >
      <div class="processo-header q-mb-lg">
        <div class="row items-start justify-between">
          <div>
            <p
              class="text-caption text-grey-5 q-mb-xs"
              style="letter-spacing: 0.08em; text-transform: uppercase"
            >
              Número do processo
            </p>
            <div class="text-h6 text-weight-bold text-grey-9">
              {{ dados!.processo.numeroProcesso }}
            </div>
            <div class="row items-center q-gutter-x-md q-mt-xs">
              <span
                class="status-label"
                :class="`status-label--${dados!.processo.status?.toLowerCase()}`"
              >
                {{ statusLabel(dados!.processo.status) }}
              </span>
              <span class="text-grey-6 text-caption">{{
                tipoAcaoLabel(dados!.processo.tipoAcaoProcesso)
              }}</span>
            </div>
            <div
              v-if="dados!.processo.cliente"
              class="text-caption text-grey-5 q-mt-xs"
            >
              Cliente: {{ dados!.processo.cliente }}
            </div>
          </div>
          <q-icon
            name="gavel"
            size="2.5em"
            color="grey-3"
          />
        </div>
      </div>

      <div
        v-if="dados!.eventos.length === 0"
        class="column items-center q-pa-xl text-grey-5"
      >
        <q-icon
          name="history"
          size="4em"
        />
        <p class="q-mt-md text-center text-body2">
          Nenhum evento registrado ainda.<br />Aguarde atualizações do seu
          advogado.
        </p>
      </div>

      <q-timeline
        v-else
        :layout="layout"
        color="primary"
      >
        <template
          v-for="grupo in gruposDeEventos"
          :key="grupo.mesAno"
        >
          <q-timeline-entry heading>
            {{ grupo.mesAno }}
          </q-timeline-entry>

          <q-timeline-entry
            v-for="(evento, idx) in grupo.eventos"
            :key="evento.id"
            :title="evento.titulo"
            :subtitle="formatarDataLonga(evento.data)"
            :side="idx % 2 === 0 ? 'right' : 'left'"
            :icon="tipoIcon(evento.tipo)"
            :color="tipoColor(evento.tipo)"
          >
            <div>
              <span
                class="tipo-chip"
                :style="{
                  background: tipoColorHex(evento.tipo) + '1A',
                  color: tipoColorHex(evento.tipo),
                }"
              >
                {{ tipoLabel(evento.tipo) }}
              </span>
              <p
                v-if="evento.descricao"
                class="text-grey-8 q-mt-sm q-mb-none"
                style="white-space: pre-line"
              >
                {{ evento.descricao }}
              </p>
            </div>
          </q-timeline-entry>
        </template>
      </q-timeline>

      <q-separator class="q-mt-xl q-mb-md" />
      <p class="text-center text-caption text-grey-5">
        Informações fornecidas pelo escritório de advocacia · INTERM
      </p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTimelineService } from '@/services'
import { formatarDataLonga, formatarMesAno } from '@/utils/date'
import type {
  TimelineEvento,
  TimelinePublica,
} from '@/types/timelines/TimelineEvento'

const $q = useQuasar()
const route = useRoute()
const timelineService = useTimelineService()

const processoId = route.params.processoId as string

const pin = ref('')
const erroPIN = ref('')
const carregando = ref(false)
const autenticado = ref(false)
const dados = ref<TimelinePublica | null>(null)

const layout = computed(() =>
  $q.screen.lt.sm ? 'dense' : $q.screen.lt.md ? 'comfortable' : 'loose',
)

const gruposDeEventos = computed(() => {
  if (!dados.value) return []

  const sorted = [...dados.value.eventos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  )

  const grupos: { mesAno: string; eventos: TimelineEvento[] }[] = []
  for (const evento of sorted) {
    const mesAno = formatarMesAno(evento.data)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.mesAno === mesAno) {
      ultimo.eventos.push(evento)
    } else {
      grupos.push({ mesAno, eventos: [evento] })
    }
  }
  return grupos
})

async function autenticar() {
  if (!pin.value || pin.value.length !== 4) {
    erroPIN.value = 'Digite exatamente 4 dígitos.'
    return
  }
  erroPIN.value = ''
  carregando.value = true
  try {
    dados.value = await timelineService.getPublic(processoId, pin.value)
    autenticado.value = true
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      erroPIN.value =
        'Código incorreto. Verifique os 4 últimos dígitos do processo.'
    } else if (status === 404) {
      erroPIN.value = 'Processo não encontrado.'
    } else {
      erroPIN.value = 'Erro ao acessar. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}

const tiposEvento = [
  { label: 'Audiência', value: 'AUDIENCIA' },
  { label: 'Sentença', value: 'SENTENCA' },
  { label: 'Recurso', value: 'RECURSO' },
  { label: 'Despacho', value: 'DESPACHO' },
  { label: 'Protocolo', value: 'PROTOCOLO' },
  { label: 'Perícia', value: 'PERICIA' },
  { label: 'Acordo', value: 'ACORDO' },
  { label: 'Outros', value: 'OUTROS' },
]

function tipoLabel(tipo: string) {
  return tiposEvento.find((t) => t.value === tipo)?.label ?? tipo
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

function tipoColor(tipo: string) {
  const map: Record<string, string> = {
    AUDIENCIA: 'primary',
    SENTENCA: 'purple',
    RECURSO: 'negative',
    DESPACHO: 'teal',
    PROTOCOLO: 'blue-grey',
    PERICIA: 'indigo',
    ACORDO: 'positive',
    OUTROS: 'grey',
  }
  return map[tipo] ?? 'grey'
}

function tipoColorHex(tipo: string) {
  const map: Record<string, string> = {
    AUDIENCIA: '#003366',
    SENTENCA: '#7B1FA2',
    RECURSO: '#C10015',
    DESPACHO: '#00796B',
    PROTOCOLO: '#546E7A',
    PERICIA: '#283593',
    ACORDO: '#2E7D32',
    OUTROS: '#757575',
  }
  return map[tipo] ?? '#757575'
}

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

function tipoAcaoLabel(tipo: string) {
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
</script>

<style scoped>
.pin-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.pin-card {
  width: 100%;
  max-width: 400px;
}

.timeline-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding-top: 40px;
}

.processo-header {
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 16px;
  padding: 24px;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
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

.tipo-chip {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 10px;
}
</style>
