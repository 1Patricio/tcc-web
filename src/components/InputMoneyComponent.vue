<template>
  <div class="base-input column full">
    <p class="text-terciary text-bold q-mb-xs">
      {{ label }}
    </p>

    <q-input
      v-model="model"
      class="full-width"
      :outlined="outlined"
      :dense="dense"
      mask="#.##"
      fill-mask="0"
      reverse-fill-mask
      prefix="R$ "
      :rules="rules"
      hide-bottom-space
      input-class="text-right"
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
  modelValue: string | number | undefined | null
  label: string
  outlined?: boolean
  dense?: boolean
  hint?: string
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