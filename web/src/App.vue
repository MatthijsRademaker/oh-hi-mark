<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  Check,
  Clipboard,
  FileText,
  Monitor,
  Moon,
  Sun,
  TriangleAlert,
} from '@lucide/vue'
import copy from 'copy-to-clipboard'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Scratchpad from '@/components/Scratchpad.vue'
import { Separator } from '@/components/ui/separator'
import { renderMarkdown } from '@/markdown'
import { readResponseEnvelope } from '@/response-envelope'
import type { ResponseEnvelope } from '@/response-envelope'
import {
  applyTheme,
  nextThemePreference,
  readThemePreference,
  saveThemePreference,
} from '@/theme'
import type { ThemePreference } from '@/theme'

const envelope = ref<ResponseEnvelope>()
const renderedMarkdown = ref('')
const loadError = ref('')
const isRendering = ref(true)
const copyStatus = ref<'idle' | 'copied' | 'failed'>('idle')
const theme = ref<ThemePreference>(readThemePreference())
let copyStatusTimer: ReturnType<typeof setTimeout> | undefined

try {
  envelope.value = readResponseEnvelope()
} catch (error) {
  loadError.value = error instanceof Error ? error.message : String(error)
  isRendering.value = false
}

applyTheme(theme.value)

const themeName = computed(() => ({
  system: 'System',
  light: 'Light',
  dark: 'Dark',
})[theme.value])

const nextThemeName = computed(() => ({
  system: 'light',
  light: 'dark',
  dark: 'system',
})[theme.value])

const themeControlLabel = computed(
  () => `Theme: ${themeName.value}. Switch to ${nextThemeName.value} theme.`,
)

async function copyResponse(): Promise<void> {
  if (!envelope.value) return

  try {
    const copied = await copy(envelope.value.text)
    copyStatus.value = copied ? 'copied' : 'failed'
  } catch {
    copyStatus.value = 'failed'
  }

  if (copyStatusTimer) clearTimeout(copyStatusTimer)
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = 'idle'
  }, 2200)
}

function cycleTheme(): void {
  theme.value = nextThemePreference(theme.value)
  applyTheme(theme.value)
  saveThemePreference(theme.value)
}

function syncSystemTheme(): void {
  if (theme.value === 'system') applyTheme('system')
}

onMounted(async () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', syncSystemTheme)

  if (!envelope.value) return

  try {
    renderedMarkdown.value = await renderMarkdown(envelope.value.text)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    loadError.value = `OHM could not render this response: ${message}`
  } finally {
    isRendering.value = false
  }
})

onUnmounted(() => {
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener(
    'change',
    syncSystemTheme,
  )
  if (copyStatusTimer) clearTimeout(copyStatusTimer)
})
</script>

<template>
  <div class="relative min-h-svh overflow-x-clip bg-background text-foreground">
    <div class="ohm-atmosphere" aria-hidden="true" />

    <header class="sticky top-0 z-20 border-b bg-background/88 backdrop-blur-xl">
      <div class="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <a
          class="group mr-auto inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href="#response"
          aria-label="OHM response"
        >
          <span class="grid size-7 place-items-center rounded-lg border bg-foreground text-[0.65rem] font-bold tracking-tight text-background shadow-sm transition-transform group-hover:-rotate-2 motion-reduce:transition-none">
            OH
          </span>
          <span class="font-semibold tracking-tight">OHM</span>
        </a>

        <Badge variant="secondary" class="hidden sm:inline-flex">
          <FileText data-icon="inline-start" aria-hidden="true" />
          Latest response
        </Badge>

        <Button
          variant="outline"
          size="sm"
          :aria-label="themeControlLabel"
          @click="cycleTheme"
        >
          <Monitor v-if="theme === 'system'" data-icon="inline-start" aria-hidden="true" />
          <Sun v-else-if="theme === 'light'" data-icon="inline-start" aria-hidden="true" />
          <Moon v-else data-icon="inline-start" aria-hidden="true" />
          <span class="hidden sm:inline">{{ themeName }}</span>
        </Button>

        <Button
          size="sm"
          :disabled="!envelope"
          :aria-label="copyStatus === 'copied' ? 'Response copied' : 'Copy response Markdown'"
          @click="copyResponse"
        >
          <Check v-if="copyStatus === 'copied'" data-icon="inline-start" aria-hidden="true" />
          <Clipboard v-else data-icon="inline-start" aria-hidden="true" />
          {{ copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy' }}
        </Button>
      </div>
    </header>

    <main id="response" class="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <Alert v-if="loadError" variant="destructive" class="mx-auto max-w-2xl p-5">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Response unavailable</AlertTitle>
        <AlertDescription>{{ loadError }}</AlertDescription>
      </Alert>

      <template v-else-if="envelope">
        <div class="ohm-review-grid">
          <section
            aria-labelledby="response-heading"
            class="ohm-response-column mx-auto w-full max-w-3xl"
          >
            <div class="mb-8 sm:mb-10">
              <p class="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Assistant response
              </p>
              <h1 id="response-heading" class="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Read with room to think.
              </h1>
              <p
                class="mt-4 max-w-full break-all font-mono text-[0.7rem] leading-relaxed text-muted-foreground sm:break-normal"
                :title="envelope.responseId"
              >
                {{ envelope.responseId }}
              </p>
            </div>

            <Separator class="mb-8 sm:mb-10" />

            <div
              v-if="isRendering"
              class="flex min-h-64 items-center justify-center rounded-xl border border-dashed bg-card/70 text-sm text-muted-foreground"
              role="status"
            >
              Rendering Markdown…
            </div>

            <article
              v-else
              class="ohm-markdown prose prose-neutral max-w-none dark:prose-invert"
              aria-labelledby="response-heading"
              v-html="renderedMarkdown"
            />
          </section>

          <Scratchpad />
        </div>
      </template>
    </main>

    <footer class="relative border-t py-5 text-center text-xs text-muted-foreground">
      Local review surface · no response-triggered image requests
    </footer>

    <p class="sr-only" role="status" aria-live="polite">
      {{ copyStatus === 'copied' ? 'Response Markdown copied to clipboard.' : copyStatus === 'failed' ? 'Could not copy response Markdown.' : '' }}
    </p>
  </div>
</template>
