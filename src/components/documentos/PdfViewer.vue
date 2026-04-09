<template>
  <q-linear-progress v-if="loading" size="6px" :value="loadingProgress" />

  <q-scroll-area v-show="!loading" style="width: 100%; height: 100%">
    <div class="pdf-container">
      <div
        v-for="index in pageIndices"
        :key="index"
        class="page-wrapper"
        :style="{
          width: pageDimensions[index] ? `${pageDimensions[index].width}px` : 'auto',
          height: pageDimensions[index] ? `${pageDimensions[index].height}px` : 'auto',
        }"
      >
        <canvas class="canvas" />

        <div class="annotation-layer" @click="(e) => handleClick(e, index)">
          <template v-for="a in annotations" :key="a.id">
            <q-icon
              v-if="a.page === index"
              name="place"
              size="20px"
              :style="{
                position: 'absolute',
                left: a.x + '%',
                top: a.y + '%',
              }"
            />
          </template>
        </div>
      </div>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import * as pdfjsLib from 'pdfjs-dist'
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker'
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker()

interface Annotation {
  id: number | string
  x: number
  y: number
  page: number
}

const props = defineProps<{
  pdfData: ArrayBuffer | null
  zoom?: number
  annotations: Annotation[]
}>()

const emit = defineEmits(['add-annotation'])

let pages: any[] = []
const pageCount = ref(0)
const pageIndices = computed(() => Array.from({ length: pageCount.value }, (_, i) => i))
const loading = ref(false)
const loadingProgress = ref(0)
const pageDimensions = ref<{ width: number; height: number }[]>([])

let pdfDoc: any = null
let pageObserver: IntersectionObserver | null = null
const renderedPages = new Set<number>()

function getScale(page: any) {
  return (1000 / page.getViewport({ scale: 1 }).width) * (props.zoom ?? 1)
}

function calculatePageDimensions() {
  pageDimensions.value = pages.map((page) => {
    const viewport = page.getViewport({ scale: getScale(page) })
    return { width: viewport.width, height: viewport.height }
  })
}

async function renderCanvas(page: any) {
  const canvas = document.getElementsByClassName('canvas')[page._pageIndex] as HTMLCanvasElement
  if (!canvas) return

  const viewport = page.getViewport({ scale: getScale(page) })
  canvas.width = viewport.width
  canvas.height = viewport.height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  await page.render({ canvasContext: ctx, viewport }).promise
}

function initIntersectionObserver() {
  if (pageObserver) pageObserver.disconnect()

  pageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const wrapper = entry.target as HTMLElement
        const pageIndex = Number(wrapper.dataset.pageIndex)
        if (!renderedPages.has(pageIndex) && pages[pageIndex]) {
          renderedPages.add(pageIndex)
          renderCanvas(pages[pageIndex])
        }
      })
    },
    { root: null, rootMargin: '100px', threshold: 0.1 },
  )

  const wrappers = document.getElementsByClassName('page-wrapper')
  for (let i = 0; i < wrappers.length; i++) {
    const wrapper = wrappers[i] as HTMLElement
    wrapper.dataset.pageIndex = String(i)
    pageObserver.observe(wrapper)
  }
}

async function loadPdf() {
  if (!props.pdfData) return

  loading.value = true
  loadingProgress.value = 0
  renderedPages.clear()
  pages = []
  pageCount.value = 0
  pageDimensions.value = []

  const blob = new Blob([props.pdfData], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const loadingTask = pdfjsLib.getDocument({ url })
  loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) loadingProgress.value = loaded / total
  }

  pdfDoc = await loadingTask.promise

  const pagePromises = []
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    pagePromises.push(pdfDoc.getPage(i))
  }
  pages = await Promise.all(pagePromises)
  pageCount.value = pages.length

  calculatePageDimensions()
  loading.value = false

  await nextTick()

  if (pages.length > 0) {
    renderedPages.add(0)
    renderCanvas(pages[0])
  }

  initIntersectionObserver()
}

async function search(term: string): Promise<number[]> {
  if (!term || !pages.length) return []
  const lowerTerm = term.toLowerCase()
  const matches: number[] = []
  for (let i = 0; i < pages.length; i++) {
    const textContent = await pages[i].getTextContent()
    const text = textContent.items.map((item: any) => item.str).join(' ').toLowerCase()
    if (text.includes(lowerTerm)) matches.push(i)
  }
  return matches
}

function scrollToPage(index: number) {
  const wrappers = document.getElementsByClassName('page-wrapper')
  if (wrappers[index]) {
    wrappers[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleClick(event: MouseEvent, pageIndex: number) {
  const target = event.currentTarget as HTMLElement
  const x = (event.offsetX / target.clientWidth) * 100
  const y = (event.offsetY / target.clientHeight) * 100
  emit('add-annotation', { id: Date.now(), x, y, page: pageIndex })
}

defineExpose({ search, scrollToPage })

watch(() => props.pdfData, loadPdf)

watch(() => props.zoom, () => {
  if (!pages.length) return
  calculatePageDimensions()
  renderedPages.clear()
  nextTick(() => initIntersectionObserver())
})

onMounted(loadPdf)

onUnmounted(() => {
  if (pageObserver) pageObserver.disconnect()
  pages = []
  pdfDoc = null
})
</script>

<style scoped>
.pdf-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-wrapper {
  margin: 16px;
  position: relative;
  border-radius: 5px;
  overflow: hidden;
  box-shadow:
    0 4px 8px 0 rgba(0, 0, 0, 0.2),
    0 2px 20px 0 rgba(0, 0, 0, 0.19);
}

.annotation-layer {
  position: absolute;
  inset: 0;
}
</style>
