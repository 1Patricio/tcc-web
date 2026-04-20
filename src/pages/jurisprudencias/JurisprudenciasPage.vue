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
          :loading="loading"
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

    <div v-if="resultadoHtml" class="q-mt-lg">
      <q-separator class="q-mb-md" />

      <div class="text-h6 q-mb-md">
        {{ totalEncontrado }} Jurisprudência{{ totalEncontrado !== 1 ? 's' : '' }} Encontrada{{ totalEncontrado !== 1 ? 's' : '' }}
      </div>

      <div class="resultado-html" v-html="resultadoHtml" />
    </div>

    <div v-else-if="buscaRealizada && !loading" class="q-mt-lg text-center text-grey-6">
      <q-icon name="search_off" size="48px" color="grey-6" />
      <p>Nenhuma jurisprudência encontrada</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputTextComponent from '@/components/InputTextComponent.vue'
import { useNotification } from '@/composables/useNotification'
import { useJurisprudenciaService } from '@/services/api/jurisprudencia.service'
import { ref, nextTick } from 'vue'

const jurisprudenciaService = useJurisprudenciaService()
const notification = useNotification()

const resultadoHtml = ref('')
const totalEncontrado = ref(0)
const loading = ref(false)
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
  loading.value = true
  buscaRealizada.value = false
  resultadoHtml.value = ''

  try {
    const data = await jurisprudenciaService.buscaRs(termo, tipoConsulta)

    if (!data.data?.html || data.data?.total === 0) {
      notification.warning('Nenhuma jurisprudência encontrada')
      return
    }

    resultadoHtml.value = data.data.html
    totalEncontrado.value = data.data.total

    await nextTick()
    document.querySelectorAll('.ver-integra-placeholder').forEach(placeholder => {
      const card = placeholder.closest('.result-juris')
      const processLink = card?.querySelector('a.a-results') as HTMLAnchorElement | null
      if (processLink) {
        const link = document.createElement('a')
        link.href = processLink.href
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.textContent = 'Ver processo no TJRS →'
        link.className = 'ver-tjrs-link'
        placeholder.replaceWith(link)
      } else {
        placeholder.remove()
      }
    })

  } catch (error) {
    notification.error('Erro ao buscar jurisprudências')
  } finally {
    loading.value = false
    buscaRealizada.value = true
  }
}
</script>

<style>
.resultado-html .result-juris {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
}

.resultado-html .title-results {
  font-weight: bold;
  color: #333;
}

.resultado-html .a-results {
  color: #911702 !important;
  text-decoration: underline !important;
  cursor: pointer;
  font-weight: 600;
}

.resultado-html .a-results:hover {
  color: #6b1001 !important;
}

.resultado-html .ver-tjrs-link {
  color: #911702;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
}

.resultado-html .ver-tjrs-link:hover {
  text-decoration: underline;
}

.resultado-html hr {
  display: none;
}

.resultado-html .aviso {
  display: none;
}
</style>
