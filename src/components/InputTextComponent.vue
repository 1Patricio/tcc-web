<template>
  <div class="base-input column full">
    <p class="text-terciary text-bold q-mb-xs">
      {{ label }}
    </p>

    <q-input 
      v-model="model" 
      class="full-width" 
      :type="type" 
      :outlined="outlined" 
      :dense="dense" 
      :mask="mask"
      :rules="rules" 
      :hint="hint" 
      :borderless="borderless" 
      :rounded="rounded" 
      hide-bottom-space
    >
      <template v-if="$slots.append" #append>
        <slot name="append" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { QInputProps } from 'quasar'

const props = defineProps<{
  modelValue: string | number | undefined
  label: string
  type?: QInputProps['type']
  outlined?: boolean
  dense?: boolean
  mask?: string
  hint?: string
  borderless?: boolean
  rounded?: boolean
  rules?: QInputProps['rules']
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})
</script>