<template>
  Edição e Visualização de Cliente
  <br>
  {{ cliente }}
</template>

<script setup lang="ts">
import { useClienteService } from '@/services';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const clienteService = useClienteService()

const idCliente = ref<string | undefined>(undefined)
const cliente = ref()

onMounted(async () => {
  try {
    idCliente.value = route.params.id as string
    cliente.value = await clienteService.getById(idCliente.value)
  } catch(error) {
    console.error(error)
  }
})
</script>