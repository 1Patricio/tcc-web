<template>
  <div class="base-input column full">
    <p class="text-terciary text-bold q-mb-xs">
      {{ label }}
    </p>
  </div>

  <q-input :dense="dense" :outlined="outlined" v-model="model" mask="##/##/####"">
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date v-model="model" mask="DD/MM/YYYY">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Fechar" color="red" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QInputProps } from 'quasar'

const props = defineProps<{
  modelValue: string
  label: string
  type?: QInputProps['type']
  outlined?: boolean
  dense?: boolean
  mask?: string
  hint?: string
  rules?: QInputProps['rules']
  inputName?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})
</script>