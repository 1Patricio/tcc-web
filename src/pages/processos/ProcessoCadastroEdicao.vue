<template>
  Edição e Visualização de Processos
  <br>
  {{ processo }}
</template>

<script setup lang="ts">
import { useProcessoService } from '@/services';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const processoService = useProcessoService()

const idProcesso = ref<string | undefined>(undefined)
const processo = ref()

onMounted(async () => {
  try {
    idProcesso.value = route.params.id as string
    processo.value = await processoService.getById(idProcesso.value)
  } catch(error) {
    console.error(error)
  }
})
</script>