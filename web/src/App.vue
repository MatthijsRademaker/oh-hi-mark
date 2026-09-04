<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Monitor, Moon, Sun, TriangleAlert } from '@lucide/vue'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import OhmLogo from '@/components/OhmLogo.vue'
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
const theme = ref<ThemePreference>(readThemePreference())

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
})
</script>

<template>
  <div class="ohm-shell min-h-svh overflow-x-clip bg-background text-foreground">
    <header class="ohm-header sticky top-0 z-20">
      <div class="ohm-header-inner mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <a
          class="ohm-brand group mr-auto inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          href="#response"
          aria-label="OHM response"
        >
          <OhmLogo />
        </a>

        <Button
          variant="outline"
          size="lg"
          class="ohm-header-control"
          :aria-label="themeControlLabel"
          @click="cycleTheme"
        >
          <Monitor v-if="theme === 'system'" data-icon="inline-start" aria-hidden="true" />
          <Sun v-else-if="theme === 'light'" data-icon="inline-start" aria-hidden="true" />
          <Moon v-else data-icon="inline-start" aria-hidden="true" />
          <span class="hidden sm:inline">{{ themeName }}</span>
        </Button>
      </div>
    </header>

    <main id="response" class="ohm-main relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Alert v-if="loadError" variant="destructive" class="ohm-wash mx-auto max-w-2xl p-5">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>Response unavailable</AlertTitle>
        <AlertDescription>{{ loadError }}</AlertDescription>
      </Alert>

      <template v-else-if="envelope">
        <div class="ohm-review-grid">
          <div class="ohm-review-masthead mx-auto w-full max-w-3xl">
            <div class="ohm-title-line">
              <h1 id="response-heading">Read with room to think.</h1>
              <span class="ohm-seal ohm-title-seal" aria-hidden="true">阅</span>
            </div>

            <Separator class="ohm-divider" />
          </div>

          <section
            :data-response-id="envelope.responseId"
            aria-labelledby="response-heading"
            class="ohm-response-column mx-auto w-full max-w-3xl"
          >
            <div v-if="isRendering" class="ohm-rendering" role="status">
              <span class="ohm-ink-loader" aria-hidden="true" />
              Rendering Markdown…
            </div>

            <!-- renderMarkdown disables raw HTML, then sanitizes final output with DOMPurify. -->
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
  </div>
</template>
