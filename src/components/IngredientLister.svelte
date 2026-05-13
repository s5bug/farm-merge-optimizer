<script lang="ts">
interface Props {
  ingredientValues: Record<string, number>
}
const { ingredientValues }: Props = $props()

const sortedKeysByValue = $derived.by(() => {
  const keys = Object.keys(ingredientValues)
  // b - a is descending order
  keys.sort((a, b) => ingredientValues[b] - ingredientValues[a])
  return keys
})
</script>

<div>
  Ingredient values:
  <ol>
  {#each sortedKeysByValue as key (key)}
    <li>{key}: {ingredientValues[key]}</li>
  {/each}
  </ol>
</div>
