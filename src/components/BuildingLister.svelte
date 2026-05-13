<script lang="ts">
interface Props {
  buildingValues: Record<string, number>
}
const { buildingValues }: Props = $props()

const sortedKeysByValue = $derived.by(() => {
  const keys = Object.keys(buildingValues)
  // b - a is descending order
  keys.sort((a, b) => buildingValues[b] - buildingValues[a])
  return keys
})
</script>

<div>
  Building EVs:
  <ol>
    {#each sortedKeysByValue as key (key)}
      <li>{key}: {buildingValues[key].toFixed(3)}</li>
    {/each}
  </ol>
</div>
