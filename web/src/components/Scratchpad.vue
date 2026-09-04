<script setup lang="ts">
import { Check, Clipboard } from '@lucide/vue'
import copy from 'copy-to-clipboard'
import { onUnmounted, ref } from 'vue'

import InkBrushStroke from '@/components/InkBrushStroke.vue'
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
    <div class="ohm-scratchpad-card ohm-wash">
      <div class="ohm-scratchpad-header">
        <div class="ohm-calligraphy-label" aria-hidden="true">
          批注 <span class="ohm-seal">记</span>
        </div>
        <h2 id="scratchpad-heading" class="ohm-eyebrow">Review notes</h2>
      </div>

      <label for="scratchpad-notes" class="sr-only">Notes to paste into your agent harness</label>
      <textarea
        id="scratchpad-notes"
        class="ohm-scratchpad-notes"
        :value="note"
        aria-describedby="scratchpad-status"
        aria-label="Scratchpad notes"
        placeholder="Write notes to paste into your agent harness…"
        spellcheck="true"
        @input="updateNote"
      />

      <div class="ohm-scratchpad-footer">
        <p id="scratchpad-status" role="status" aria-live="polite">
          {{ copyStatus === 'copied' ? 'Notes copied. Paste into your agent harness.' : copyStatus === 'failed' ? 'Could not copy notes.' : '' }}
        </p>
        <Button
          type="button"
          size="lg"
          class="ohm-brush-button shrink-0"
          :disabled="!note.trim()"
          :aria-label="copyStatus === 'copied' ? 'Scratchpad notes copied' : 'Copy scratchpad notes for agent harness'"
          @click="copyNotes"
        >
          <InkBrushStroke />
          <Check v-if="copyStatus === 'copied'" data-icon="inline-start" aria-hidden="true" />
          <Clipboard v-else data-icon="inline-start" aria-hidden="true" />
          <span>{{ copyStatus === 'copied' ? 'Copied' : 'Copy for agent' }}</span>
        </Button>
      </div>
    </div>
  </aside>
</template>
