<script lang="ts">
interface Props {
  recipeValues: Record<string, number>
}
const { recipeValues }: Props = $props()

const sortedKeysByValue = $derived.by(() => {
  const keys = Object.keys(recipeValues)
  // b - a is descending order
  keys.sort((a, b) => recipeValues[b] - recipeValues[a])
  return keys
})
</script>

<div>
  Recipe values:
  <ol>
    {#each sortedKeysByValue as key (key)}
      <li>{key}: {recipeValues[key].toFixed(3)}</li>
    {/each}
  </ol>
</div>
