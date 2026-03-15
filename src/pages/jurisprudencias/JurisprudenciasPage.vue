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
          :disabled="!formData.palavraChave?.trim()"        
        />
      </div>
    </div>

    <div class="q-px-md q-pt-sm">
      <q-option-group
        v-model="formData.tipoPesquisa"
        :options="options"
        color="primary"
        inline
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputTextComponent from '@/components/InputTextComponent.vue';
import { ref } from 'vue'

const formData = ref({
  palavraChave: '',
  tipoPesquisa: 'ementa'
})

const options = [
  {
    label: 'Ementa',
    value: 'ementa'
  },
  {
    label: 'Inteiro Teor',
    value: 'inteiro-teor'
  },
]
</script>