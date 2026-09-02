<script setup lang="ts">
import { Check } from '@lucide/vue'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  responseId: string
}>()

const note = ref('')
const persistence = ref<'saved' | 'unavailable'>('saved')
const isLoaded = ref(false)

function storageKey(responseId: string): string {
  return `ohm-scratchpad:${responseId}`
}

function loadNote(): void {
  isLoaded.value = false

  try {
    note.value = window.localStorage.getItem(storageKey(props.responseId)) ?? ''
    persistence.value = 'saved'
  } catch {
    note.value = ''
    persistence.value = 'unavailable'
  } finally {
    isLoaded.value = true
  }
}

function saveNote(): void {
  if (!isLoaded.value) return

  try {
    window.localStorage.setItem(storageKey(props.responseId), note.value)
    persistence.value = 'saved'
  } catch {
    persistence.value = 'unavailable'
  }
}

function updateNote(event: Event): void {
  note.value = (event.currentTarget as HTMLTextAreaElement).value
  saveNote()
}

onMounted(loadNote)
watch(() => props.responseId, loadNote)
</script>

<template>
  <aside class="ohm-scratchpad" aria-labelledby="scratchpad-heading">
    <div class="ohm-scratchpad-card rounded-2xl border bg-card/90 p-5 shadow-lg shadow-foreground/5 backdrop-blur-xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Review notes
          </p>
          <h2 id="scratchpad-heading" class="text-lg font-semibold tracking-tight">
            Scratchpad
          </h2>
        </div>
        <span class="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
          <Check v-if="persistence === 'saved'" class="size-3.5" aria-hidden="true" />
          {{ persistence === 'saved' ? 'Local' : 'Session only' }}
        </span>
      </div>

      <label for="scratchpad-notes" class="sr-only">Notes for this response</label>
      <textarea
        id="scratchpad-notes"
        class="ohm-scratchpad-notes mt-5 w-full rounded-xl border bg-background/70 px-3.5 py-3 text-sm leading-6 shadow-inner outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        :value="note"
        aria-describedby="scratchpad-status"
        aria-label="Scratchpad notes"
        placeholder="Capture questions, ideas, and follow-ups…"
        spellcheck="true"
        @input="updateNote"
      />

      <p id="scratchpad-status" class="mt-3 text-xs leading-5 text-muted-foreground" role="status" aria-live="polite">
        {{ persistence === 'saved' ? 'Notes save locally with this response.' : 'Could not save locally; notes remain for this tab.' }}
      </p>
    </div>
  </aside>
</template>
