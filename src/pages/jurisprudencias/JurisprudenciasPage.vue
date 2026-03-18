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

    <div v-if="listaJurisprudencia.length > 0" class="q-mt-lg">
      <q-separator class="q-mb-md" />

      <div class="text-h6 q-mb-md">
        📚 {{ listaJurisprudencia.length }} Jurisprudência{{ listaJurisprudencia.length > 1 ? 's' : '' }} Encontrada{{ listaJurisprudencia.length > 1 ? 's' : '' }}
      </div>

      <div v-for="(juris, index) in listaJurisprudencia" :key="index" class="q-mb-md">
        <q-card flat bordered>

          <q-card-section class="bg-grey-2">
            <div class="row items-center justify-between">
              <div class="col">
                <div class="text-h6 text-primary">
                  {{ juris.nome_tribunal }} - {{ juris.numero_processo }}
                </div>
                <div class="text-caption text-grey-7">
                  {{ juris.nome_assunto_cnj }}
                </div>
              </div>

              <div class="col-auto">
                <q-btn
                  :href="getLink(juris.numero_processo)"
                  target="_blank"
                  color="primary"
                  flat
                  dense
                  icon="open_in_new"
                  label="Ver no Tribunal"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-xs">
              Ementa
            </div>

            <div class="ementa-container">
              <p 
                class="text-body2 ementa-text"
                :class="{ expanded: expanded[index] }"
              >
                {{ formatarEmenta(juris.ementa_text) }}
              </p>

              <div v-if="!expanded[index]" class="fade-overlay" />
            </div>

            <q-btn 
              v-if="juris.ementa_text && formatarEmenta(juris.ementa_text).length > 300"
              flat 
              dense 
              color="primary" 
              :label="expanded[index] ? 'Ver menos' : 'Ver mais'"
              @click="toggleExpand(index)"
              class="q-mt-xs"
            />

            <q-btn
              v-if="juris.documento_text"
              color="secondary"
              flat
              dense
              icon="description"
              label="Ver inteiro teor"
              class="q-mt-sm"
              @click="abrirInteiroTeor(juris.documento_text)"
            />
          </q-card-section>

        </q-card>
      </div>
    </div>

    <div v-else-if="buscaRealizada && !loading" class="q-mt-lg text-center text-grey-6">
      <q-icon name="search_off" size="48px" color="grey-6" />
      <p>Nenhuma jurisprudência encontrada</p>
    </div>

    <q-dialog v-model="dialogInteiroTeor">
      <q-card class="modal-inteiro-teor">

        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Inteiro Teor</div>
          <q-btn icon="close" flat round dense v-close-popup color="grey-8" />
        </q-card-section>

        <q-separator />

        <q-card-section class="conteudo-html">
          <div v-html="inteiroTeorHTML"></div>
        </q-card-section>

      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import InputTextComponent from '@/components/InputTextComponent.vue'
import { useNotification } from '@/composables/useNotification'
import { useJurisprudenciaService } from '@/services/api/jurisprudencia.service'
import { ref } from 'vue'

const jurisprudenciaService = useJurisprudenciaService()
const notification = useNotification()

const listaJurisprudencia = ref<any[]>([])
const loading = ref(false)
const buscaRealizada = ref(false)
const expanded = ref<Record<number, boolean>>({})

const dialogInteiroTeor = ref(false)
const inteiroTeorHTML = ref('')

const formData = ref({
  palavraChave: '',
  tipoPesquisa: 'ementa_completa'
})

const options = [
  { label: 'Ementa', value: 'ementa_completa' },
  { label: 'Inteiro Teor', value: 'documento_text' },
]

function toggleExpand(index: number) {
  expanded.value[index] = !expanded.value[index]
}

function getLink(numero: string) {
  return `https://consulta.tjrs.jus.br/consulta-processual/processo/resumo?numeroProcesso=${numero}`
}

function isValidBase64(str: string): boolean {
  // Remove espaços e quebras de linha
  const clean = str.replace(/\s/g, '')
  
  // Verifica se contém apenas caracteres base64 válidos
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  
  // Deve ter tamanho múltiplo de 4 (após adicionar padding)
  const validLength = clean.length % 4 === 0
  
  return base64Regex.test(clean) && validLength && clean.length > 0
}

function abrirInteiroTeor(base64: string) {
  try {
    if (!base64) {
      notification.warning('Inteiro teor não disponível')
      return
    }

    let html = ''

    // Verifica se é base64 válido
    if (isValidBase64(base64)) {
      // Remove caracteres não-base64 (mantém apenas A-Z, a-z, 0-9, +, /, =)
      const cleanBase64 = base64.replace(/[^A-Za-z0-9+/=]/g, '')

      try {
        const binary = atob(cleanBase64)
        const bytes = new Uint8Array(binary.length)
        
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }

        // Tenta diferentes encodings
        const encodings = ['utf-8', 'iso-8859-1', 'windows-1252']

        for (const enc of encodings) {
          try {
            html = new TextDecoder(enc).decode(bytes)
            if (!html.includes('�')) break
          } catch {}
        }
      } catch (error) {
        console.error('Erro ao decodificar base64:', error)
        notification.error('Erro ao decodificar o conteúdo')
        return
      }
    } else {
      // Se não for base64 válido, tenta usar o conteúdo diretamente
      html = base64
    }

    if (!html || html.trim().length === 0) {
      notification.error('Conteúdo vazio ou inválido')
      return
    }

    inteiroTeorHTML.value = html
    dialogInteiroTeor.value = true

  } catch (error) {
    console.error('Erro ao abrir inteiro teor:', error)
    notification.error('Erro ao processar o inteiro teor')
  }
}

async function buscarJurisprudenciaRS(termo: string, conteudoBusca: string) {
  loading.value = true
  buscaRealizada.value = false

  try {
    const data = await jurisprudenciaService.buscaRs(termo, conteudoBusca)

    if (!data.docs || data.numFound === 0) {
      notification.warning('Nenhuma jurisprudência encontrada')
      listaJurisprudencia.value = []
      return
    }

    listaJurisprudencia.value = data.docs

  } catch (error) {
    notification.error('Erro ao buscar jurisprudências')
  } finally {
    loading.value = false
    buscaRealizada.value = true
  }
}

function formatarEmenta(input: string | string[]) {
  let texto = Array.isArray(input) ? input.join(' ') : input

  return texto
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .trim()
}
</script>

<style scoped>
.ementa-container {
  position: relative;
}

.ementa-text {
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.ementa-text.expanded {
  max-height: 1000px;
}

.fade-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 1)
  );
}

.modal-inteiro-teor {
  width: 90vw;
  height: 90vh;
  max-width: 1300px; 
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.conteudo-html {
  flex: 1;
  overflow: auto;
  background: #fff;
  padding: 20px;
  line-height: 1.6;
  font-size: 14px;
}
</style>