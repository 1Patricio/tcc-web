<template>
  <div class="q-pa-md">
    <div class="flex justify-between items-center q-mb-sm" style="height: 80px;">
      <div class="flex column">
        <h4 class="text-terciary text-bold q-my-sm">Jurisprudência RS</h4>
        <p class="text-terciary q-my-none">Busque por modelos de Jurisprudências</p>
      </div>
    </div>
  </div>

  <div class="q-pa-md">
    <div class="flex items-center">
      <div style="width: 80%;">
        <InputTextComponent
          label="Palavras-Chave"
          v-model="formData.palavraChave"
          :rounded="true"
          :outlined="true"
        />
      </div>

      <div>
        <q-btn
          color="secondary"
          icon="balance"
          label="Buscar no TJRS"
          class="q-ml-sm"
          style="margin-top: 20px;"
          :loading="isLoading"
          :disabled="!formData.palavraChave?.trim()"
          @click="buscarJurisprudenciaRS(formData.palavraChave, formData.tipoPesquisa)"
        />
      </div>
    </div>

    <div class="q-px-md q-pt-sm flex justify-center">
      <q-option-group
        v-model="formData.tipoPesquisa"
        :options="options"
        color="primary"
        inline
      />
    </div>

    <div v-if="resultados.length > 0" class="q-mt-lg">
      <q-separator class="q-mb-md" />

      <div class="text-h6 q-mb-md">
        {{ totalEncontrado }} Jurisprudência{{ totalEncontrado !== 1 ? 's' : '' }} Encontrada{{ totalEncontrado !== 1 ? 's' : '' }}
      </div>

      <q-card v-for="item in resultados" :key="item.codEmenta" flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 text-weight-bold text-primary q-mb-xs">
            {{ item.tipoProcesso }} — {{ item.orgaoJulgador }}
          </div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Processo: {{ item.numeroProcesso }}
            <span v-if="item.relator"> | Relator: {{ item.relator }}</span>
            <span v-if="item.dataJulgamento"> | {{ new Date(item.dataJulgamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}</span>
          </div>
          <div class="text-body2">{{ item.ementa }}</div>
        </q-card-section>
        <q-card-actions>
          <q-btn
            flat dense color="primary" icon="open_in_new" label="Ver no TJRS"
            :href="`https://www.tjrs.jus.br/buscas/jurisprudencia/?q_palavra_chave=${item.numeroProcesso}&conteudo_busca=ementa_completa`"
            target="_blank" rel="noopener noreferrer"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else-if="buscaRealizada && !isLoading" class="q-mt-lg text-center text-grey-6">
      <q-icon name="search_off" size="48px" color="grey-6" />
      <p>Nenhuma jurisprudência encontrada</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputTextComponent from '@/components/InputTextComponent.vue'
import { useNotification } from '@/composables/useNotification'
import { useJurisprudenciaService } from '@/services/api/jurisprudencia.service'
import { ref } from 'vue'

const jurisprudenciaService = useJurisprudenciaService()
const notification = useNotification()

const resultados = ref<any[]>([])
const totalEncontrado = ref(0)
const isLoading = ref(false)
const buscaRealizada = ref(false)

const formData = ref({
  palavraChave: '',
  tipoPesquisa: 'ementa'
})

const options = [
  { label: 'Ementa', value: 'ementa' },
  { label: 'Inteiro Teor', value: 'Inteiro Teor' },
]

async function buscarJurisprudenciaRS(termo: string, tipoConsulta: string) {
  isLoading.value = true
  buscaRealizada.value = false
  resultados.value = []

  try {
    const data = await jurisprudenciaService.buscaRs(termo, tipoConsulta)

    if (!data.resultados?.length) {
      notification.warning('Nenhuma jurisprudência encontrada')
      return
    }

    resultados.value = data.resultados
    totalEncontrado.value = data.total

  } catch (error) {
    notification.error('Erro ao buscar jurisprudências')
  } finally {
    isLoading.value = false
    buscaRealizada.value = true
  }
}
</script>

