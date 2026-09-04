<script setup lang="ts">
import { useId } from 'vue'

// Unique per instance so several strokes on one page cannot capture each
// other's mask reference.
const taperId = `ohm-stroke-taper-${useId()}`
const dryId = `ohm-stroke-dry-${useId()}`
const maskId = `ohm-stroke-mask-${useId()}`
</script>

<template>
  <svg
    class="ohm-ink-stroke size-stroke"
    viewBox="0 0 184 48"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <!-- Thins the pigment at both ends, the way a brush lands and lifts. -->
      <linearGradient :id="taperId" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#000000" />
        <stop offset="0.04" stop-color="#4a4a4a" />
        <stop offset="0.11" stop-color="#c8c8c8" />
        <stop offset="0.24" stop-color="#ffffff" />
        <stop offset="0.62" stop-color="#e2e2e2" />
        <stop offset="0.82" stop-color="#c0c0c0" />
        <stop offset="0.93" stop-color="#6e6e6e" />
        <stop offset="1" stop-color="#000000" />
      </linearGradient>
      <!-- Drier at the trailing edge, the way pigment runs out mid-stroke. -->
      <linearGradient :id="dryId" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="0.55" stop-color="#dcdcdc" />
        <stop offset="1" stop-color="#a8a8a8" />
      </linearGradient>
      <mask :id="maskId">
        <rect width="184" height="48" :fill="`url(#${taperId})`" />
        <rect
          width="184"
          height="48"
          :fill="`url(#${dryId})`"
          style="mix-blend-mode: multiply"
        />
      </mask>
    </defs>

    <g :mask="`url(#${maskId})`">
      <path
        class="ohm-ink-stroke-body"
        d="M3 25C8 17 18 14 31 12 55 8 77 10 98 8c25-2 49-5 70 1 8 2 12 6 13 11 1 7-7 12-17 14-23 5-44 2-66 5-25 3-52 4-74 0C12 37 5 33 3 25Z"
      />
      <path
        class="ohm-ink-stroke-layer"
        d="M12 19c27-7 51-4 75-6 30-3 56-7 82 0 6 2 10 4 11 7-34-3-59 1-88 3-28 2-51-1-80 4-6 1-9-3 0-8Z"
      />
      <g class="ohm-ink-bristles" fill="none" stroke="currentColor" stroke-linecap="round">
        <path d="M5 19C18 14 27 13 42 12M2 29c13-3 23-3 37-3M8 36c12-1 20 0 31 2" />
        <path d="M145 9c17 0 28 2 37 7m-39 18c15 2 26 1 38-4m-27 8c11 0 18-1 25-4" />
      </g>
    </g>
  </svg>
</template>
