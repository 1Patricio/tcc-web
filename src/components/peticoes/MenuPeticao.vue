<template>
  <q-menu
    context-menu
    touch-position
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-list style="min-width: 160px">
      <q-item
        v-if="copyItem"
        v-close-popup
        clickable
        @click="emit('onCopy')"
      >
        <q-item-section avatar>
          <q-icon
            name="content_copy"
            color="primary"
          />
        </q-item-section>
        <q-item-section>Copiar</q-item-section>
      </q-item>

      <q-separator v-if="copyItem && deleteItem" />

      <q-item
        v-if="deleteItem"
        v-close-popup
        clickable
        @click="emit('onDelete')"
      >
        <q-item-section avatar>
          <q-icon
            name="delete"
            color="red-6"
          />
        </q-item-section>
        <q-item-section class="text-red-6">Excluir</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    copyItem?: boolean
    deleteItem?: boolean
  }>(),
  {
    copyItem: true,
    deleteItem: true,
  },
)

const emit = defineEmits<{
  (e: 'onCopy'): void
  (e: 'onDelete'): void
}>()
</script>
