<script lang="ts">
import type { Building, Recipe } from '../lib/farm-merge-data.ts'

interface Props {
  data: Awaited<typeof import('../lib/farm-merge-data.ts')>
  enabledBuildings: Record<Building, boolean>
  availableRecipes: Recipe[]
  recipeValues: Record<string, number>
  buildingValues: Record<string, number>
}
let {
  data,
  enabledBuildings,
  availableRecipes,
  recipeValues,
  buildingValues,
}: Props = $props()

let buildingList = $derived(
  data.buildings.filter((building) => enabledBuildings[building]),
)

let selectedRecipeForBuilding: Partial<Record<string, Recipe>> = $state({})
let buildingRecipesByValue: Record<string, Recipe[]> = $derived.by(() => {
  let partial: Record<string, Recipe[]> = {}
  for (const recipe of availableRecipes) {
    const building = data.recipeBuildings[recipe]
    if (!partial[building]) partial[building] = []
    partial[building].push(recipe)
  }
  for (const building of buildingList) {
    // b - a is greatest first
    partial[building]?.sort((a, b) => recipeValues[b] - recipeValues[a])
  }
  return partial
})

// 1. sort the buildings by (EV + recipe value)
// 2. while the buildings list isn't empty,
//    a. pull out the highest-value
//    b. if any ingredients in that recipe are in the ingredients set, mark it as NOT WORTH
//       otherwise, mark it as WORTH
//    c. add all the ingredients to the ingredients set
let buildingProfitAndEv: Record<string, number> = $derived.by(() => {
  let result: Record<string, number> = {}
  for (const building of buildingList) {
    const ev = buildingValues[building]
    const br = selectedRecipeForBuilding[building]
    if (br) {
      const rv = recipeValues[br]
      result[building] = ev + rv
    }
  }
  return result
})
let buildingsByProfitEv: string[] = $derived.by(() => {
  const keys = Object.keys(buildingProfitAndEv)
  // b - a puts greatest first
  keys.sort((a, b) => buildingProfitAndEv[b] - buildingProfitAndEv[a])
  return keys
})
let markBuildings: Record<string, boolean> = $derived.by(() => {
  // iterate from highest to lowest value
  const ingredientsUsed: Set<string> = new Set()
  const result: Record<string, boolean> = {}
  for (const building of buildingsByProfitEv) {
    const recipe = selectedRecipeForBuilding[building] as Recipe
    const recipeData = data.recipeDescriptions[recipe]
    let mark = true
    for (const ingredient of Object.keys(recipeData.ingredients)) {
      if (ingredientsUsed.has(ingredient)) {
        mark = false
        break
      }
    }
    result[building] = mark
    for (const recipe of buildingRecipesByValue[building as Building]) {
      const recipeData = data.recipeDescriptions[recipe]
      for (const ingredient of Object.keys(recipeData.ingredients)) {
        ingredientsUsed.add(ingredient)
      }
    }
  }
  return result
})
let buildingsInOrder: string[] = $derived(
  buildingsByProfitEv.filter((building) => markBuildings[building]),
)
</script>

<div class="building-table-container">
  {#each buildingList as building (building)}
    <div class="building-table-entry">
      <div>{building}</div>
      <div>
        <select bind:value={selectedRecipeForBuilding[building]}>
          <option value={undefined}></option>
          {#each buildingRecipesByValue[building] as recipe (recipe)}
            <option value={recipe}>{recipe}</option>
          {/each}
        </select>
      </div>
      <div>
        {#if markBuildings[building]}
          <span class="good-news">#{1 + buildingsInOrder.indexOf(building)} Value</span>
        {:else}
          <span class="bad-news">Bad Value</span>
        {/if}
      </div>
      <div>Total Value: {buildingProfitAndEv[building]}</div>
      <hr>
      <div>Building value: {buildingValues[building]}</div>
      <div>
        Recipe values:
        <ol>
          {#each buildingRecipesByValue[building] as recipe (recipe)}
            <li>{recipe}: {recipeValues[recipe].toFixed(3)}</li>
          {/each}
        </ol>
      </div>
    </div>
  {/each}
</div>

<style>
  .building-table-container {
      display: flex;
      flex-direction: row;
      width: 100%;
  }

  .building-table-entry {
      flex-grow: 1;
      margin: 0 8px;
  }

  .good-news {
      color: green;
  }

  .bad-news {
      color: red;
  }
</style>
