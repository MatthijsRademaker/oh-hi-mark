<script setup lang="ts">
import { Check, Clipboard } from '@lucide/vue'
import copy from 'copy-to-clipboard'
import { onUnmounted, ref } from 'vue'

import { Button } from '@/components/ui/button'

const note = ref('')
const copyStatus = ref<'idle' | 'copied' | 'failed'>('idle')
let copyStatusTimer: ReturnType<typeof setTimeout> | undefined

function updateNote(event: Event): void {
  note.value = (event.currentTarget as HTMLTextAreaElement).value
  copyStatus.value = 'idle'
}

async function copyNotes(): Promise<void> {
  if (!note.value.trim()) return

  try {
    const copied = await copy(note.value)
    copyStatus.value = copied ? 'copied' : 'failed'
  } catch {
    copyStatus.value = 'failed'
  }

  if (copyStatusTimer) clearTimeout(copyStatusTimer)
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = 'idle'
  }, 2200)
}

onUnmounted(() => {
  if (copyStatusTimer) clearTimeout(copyStatusTimer)
})
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
        <span class="inline-flex shrink-0 items-center rounded-full border bg-background/70 px-2.5 py-1 text-[0.68rem] font-medium text-muted-foreground">
          Not saved
        </span>
      </div>

      <label for="scratchpad-notes" class="sr-only">Notes to paste into your agent harness</label>
      <textarea
        id="scratchpad-notes"
        class="ohm-scratchpad-notes mt-5 w-full rounded-xl border bg-background/70 px-3.5 py-3 text-sm leading-6 shadow-inner outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        :value="note"
        aria-describedby="scratchpad-status"
        aria-label="Scratchpad notes"
        placeholder="Write notes to paste into your agent harness…"
        spellcheck="true"
        @input="updateNote"
      />

      <div class="mt-4 flex items-center justify-between gap-3">
        <p id="scratchpad-status" class="text-xs leading-5 text-muted-foreground" role="status" aria-live="polite">
          {{ copyStatus === 'copied' ? 'Notes copied. Paste into your agent harness.' : copyStatus === 'failed' ? 'Could not copy notes.' : 'Nothing is saved locally.' }}
        </p>
        <Button
          type="button"
          size="sm"
          class="shrink-0"
          :disabled="!note.trim()"
          :aria-label="copyStatus === 'copied' ? 'Scratchpad notes copied' : 'Copy scratchpad notes for agent harness'"
          @click="copyNotes"
        >
          <Check v-if="copyStatus === 'copied'" data-icon="inline-start" aria-hidden="true" />
          <Clipboard v-else data-icon="inline-start" aria-hidden="true" />
          {{ copyStatus === 'copied' ? 'Copied' : 'Copy for agent' }}
        </Button>
      </div>
    </div>
  </aside>
</template>
