<template>
  <div
    style="display: inline-block"
    @click="pickFiles"
    @dragover.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @drop.stop.prevent="onDrop"
  >
    <slot :drag-over="dragOver" />
    <input
      ref="inputRef"
      type="file"
      style="display: none"
      :multiple="multiple"
      :accept="acceptAttr"
      @change="onSelectFiles"
      @cancel.stop
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

interface Props {
  accept?: string[]
  acceptHint?: string
  maxSizeMb?: number
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accept: undefined,
  acceptHint: undefined,
  maxSizeMb: undefined,
  multiple: true,
})

const emit = defineEmits<{
  (e: 'change', files: File[]): void
}>()

const notification = useNotification()

const dragOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

const acceptAttr = computed(() => props.accept?.join(','))

const pickFiles = () => inputRef.value?.click()

function onDrop(event: DragEvent) {
  dragOver.value = false
  emitValidFiles(Array.from(event.dataTransfer?.files ?? []))
}

function onSelectFiles(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files ?? [])
  target.value = ''
  emitValidFiles(files)
}

function emitValidFiles(selected: File[]) {
  let files = props.multiple ? selected : selected.slice(0, 1)

  if (props.accept) {
    const allowed = props.accept
    for (const file of files.filter((file) => !allowed.includes(file.type))) {
      notification.warning(
        `Tipo de arquivo não permitido: "${file.name}". ${props.acceptHint ?? ''}`.trim(),
      )
    }
    files = files.filter((file) => allowed.includes(file.type))
  }

  if (props.maxSizeMb) {
    const maxBytes = props.maxSizeMb * 1024 * 1024
    for (const file of files.filter((file) => file.size > maxBytes)) {
      notification.warning(
        `"${file.name}" ultrapassa o limite de ${props.maxSizeMb}MB`
      )
    }
    files = files.filter((file) => file.size <= maxBytes)
  }

  if (!files.length) return
  emit('change', files)
}

defineExpose({ pickFiles })
</script>
