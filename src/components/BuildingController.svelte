<script lang="ts">
import { untrack } from 'svelte'
import type { Building } from '../lib/farm-merge-data.ts'

interface Props {
  data: Awaited<typeof import('../lib/farm-merge-data.ts')>
  level: number
  enabledBuildings: Record<Building, boolean>
}
let { data, level, enabledBuildings = $bindable() }: Props = $props()

let keys = $derived(
  data.buildings.filter((building) => data.buildingLevels[building] <= level),
)

// disable keys that are below the level requirement
$effect(() => {
  const currentLevel = level
  untrack(() => {
    for (const building of data.buildings) {
      if (data.buildingLevels[building] > currentLevel) {
        enabledBuildings[building] = false
      }
    }
  })
})
</script>

<div>
  Enabled buildings:
{#each keys as key (key)}
  <div>
  <label>
    <input type="checkbox" bind:checked={enabledBuildings[key]}>
    {key}
  </label>
  </div>
{/each}
</div>
