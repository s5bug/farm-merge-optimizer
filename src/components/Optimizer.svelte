<script lang="ts">
import solver, { type Model } from 'javascript-lp-solver'
import type { Building, Recipe } from '../lib/farm-merge-data.ts'
import BuildingController from './BuildingController.svelte'
import BuildingLister from './BuildingLister.svelte'
import BuildingTable from './BuildingTable.svelte'
import IngredientLister from './IngredientLister.svelte'
import LevelController from './LevelController.svelte'
import RecipeLister from './RecipeLister.svelte'

interface Props {
  data: Awaited<typeof import('../lib/farm-merge-data.ts')>
}
let { data }: Props = $props()

let level = $state(data.minLevel)
let enabledBuildings: Partial<Record<Building, boolean>> = $state({})

const recipeRewardHelper = (rewards: string[]): number => {
  return rewards.reduce((sum, reward) => sum + data.coinValues[reward], 0)
}

let availableRecipes = $derived(
  data.recipes.filter((recipe) => {
    const unlockedByLevel = data.recipeLevels[recipe] <= level
    const unlockedByBuilding =
      enabledBuildings[data.recipeBuildings[recipe]] ?? false
    return unlockedByLevel && unlockedByBuilding
  })
)

let availableRecipeRewards = $derived.by(() => {
  const result: Record<string, number> = {}

  for (const recipe of availableRecipes) {
    const recipeData = data.recipeDescriptions[recipe]

    result[recipe] = recipeRewardHelper(recipeData.rewards)
  }

  return result
})

let ingredientValues = $derived.by(() => {
  const model: Model = {
    optimize: 'objective_sum',
    opType: 'min',
    constraints: {},
    variables: {},
  }

  // a recipe constrains that (sum of ingredient values) >= (recipe reward)
  for (const recipe of availableRecipes) {
    model.constraints[recipe] = { min: availableRecipeRewards[recipe] }
  }

  // we are trying to solve for the value of ingredients
  for (const recipe of availableRecipes) {
    const recipeData = data.recipeDescriptions[recipe]
    for (const [ingredient, amount] of Object.entries(recipeData.ingredients)) {
      if (!model.variables[ingredient]) {
        model.variables[ingredient] = { objective_sum: 1 }
      }
      model.variables[ingredient][recipe] = amount
    }
  }

  const results = solver.Solve(model) as Record<string, number>

  const ingredientValues: Record<string, number> = {}
  for (const ingredient of Object.keys(model.variables)) {
    ingredientValues[ingredient] = results[ingredient] || 0
  }

  return ingredientValues
})

let recipeProfits = $derived.by(() => {
  const result: Record<string, number> = {}

  for (const recipe of availableRecipes) {
    const recipeReward = availableRecipeRewards[recipe]
    const ingredientCosts = Object.entries(
      data.recipeDescriptions[recipe].ingredients,
    ).reduce(
      (sum, [ingredient, count]) => sum + ingredientValues[ingredient] * count,
      0,
    )
    result[recipe] = recipeReward - ingredientCosts
  }

  return result
})

let buildingEv = $derived.by(() => {
  // EV is the average of all our recipe profits
  // I'm assuming a recipe is rolled at random here
  const listOfProfits: Record<string, number[]> = {}

  for (const [recipe, profit] of Object.entries(recipeProfits)) {
    const building = data.recipeBuildings[recipe as Recipe]
    if (!listOfProfits[building]) listOfProfits[building] = []
    listOfProfits[building].push(profit)
  }

  const evs: Record<string, number> = {}
  for (const [building, profits] of Object.entries(listOfProfits)) {
    evs[building] = profits.reduce((x, y) => x + y, 0) / profits.length
  }

  return evs
})
</script>

<div id="container">
  <div id="left-panel">
    <LevelController bind:level={level} minLevel={data.minLevel} maxLevel={data.maxLevel} />
    <BuildingController data={data} level={level} bind:enabledBuildings={enabledBuildings} />

    <hr>

    <IngredientLister ingredientValues={ingredientValues} />
    <RecipeLister recipeValues={recipeProfits} />
    <BuildingLister buildingValues={buildingEv} />
  </div>
  <div id="right-panel">
    <BuildingTable data={data} enabledBuildings={enabledBuildings} availableRecipes={availableRecipes} recipeValues={recipeProfits} buildingValues={buildingEv} />
  </div>
</div>

<style>
  #container {
      display: flex;
      width: 100%;
      height: 100%;
  }

  #right-panel {
      flex-grow: 1;
  }
</style>
