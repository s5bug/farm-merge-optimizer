import buildingsJson from './farm-merge-data/buildings.json'
import levelsJson from './farm-merge-data/levels.json'
import recipesJson from './farm-merge-data/recipes.json'

export type Building = keyof typeof buildingsJson
export type Recipe = keyof typeof recipesJson
export type Level = number

export const buildings: Building[] = Object.keys(buildingsJson) as Building[]
export const recipes: Recipe[] = Object.keys(recipesJson) as Recipe[]

export let minLevel: number = Infinity
export let maxLevel: number = -Infinity

export const levelRecipes: Record<Level, Recipe[]> = (() => {
  const partialLevelRecipes: Record<Level, Recipe[]> = {}

  let level: keyof typeof levelsJson
  for (level in levelsJson) {
    const levelNumber = Number(level)

    minLevel = Math.min(minLevel, levelNumber)
    maxLevel = Math.max(maxLevel, levelNumber)

    partialLevelRecipes[levelNumber] = levelsJson[level]
      .recipes_unlocked as Recipe[]
  }

  return partialLevelRecipes
})()

export const recipeLevels: Record<Recipe, Level> = (() => {
  const partialRecipeLevels: Partial<Record<Recipe, Level>> = {}

  for (let level = minLevel; level <= maxLevel; level++) {
    const recipes = levelRecipes[level]
    for (const recipe of recipes) {
      partialRecipeLevels[recipe] = level
    }
  }

  return partialRecipeLevels as Record<Recipe, Level>
})()
recipes.sort((a, b) => recipeLevels[a] - recipeLevels[b])

export const buildingRecipes = buildingsJson as Record<Building, Recipe[]>

export const recipeBuildings: Record<Recipe, Building> = (() => {
  const partialRecipeBuildings: Partial<Record<Recipe, Building>> = {}

  let buildingName: Building
  for (buildingName in buildingRecipes) {
    const recipes = buildingRecipes[buildingName]
    for (const recipe of recipes) {
      partialRecipeBuildings[recipe] = buildingName
    }
  }

  return partialRecipeBuildings as Record<Recipe, Building>
})()

export const buildingLevels: Record<Building, Level> = (() => {
  const partialBuildingLevels: Partial<Record<Building, Level>> = {}

  // exclude level 1 recipes because those unlock on building unlock
  for (let level = minLevel + 1; level <= maxLevel; level++) {
    const recipes = levelRecipes[level]
    for (const recipe of recipes) {
      const building = recipeBuildings[recipe]
      partialBuildingLevels[building] = Math.min(
        partialBuildingLevels[building] ?? Infinity,
        level,
      )
    }
  }

  return partialBuildingLevels as Record<Building, Level>
})()
buildings.sort((a, b) => buildingLevels[a] - buildingLevels[b])

export const coinValues = (() => {
  const partialCoinValues: Record<string, number> = {}

  for (let i = 0; i < 10; i++) {
    const coinName = `coin_${i + 1}`
    // base coin value: 3^i
    // bonus from merging: (6/5)^(9-i)
    partialCoinValues[coinName] = 3 ** i * (6 / 5) ** (9 - i)
  }

  return partialCoinValues
})()

export interface RecipeDescription {
  ingredients: Record<string, number>
  rewards: string[]
}

export const recipeDescriptions: Record<Recipe, RecipeDescription> = (() => {
  const partialRecipeDescriptions: Partial<Record<Recipe, RecipeDescription>> =
    {}

  for (const recipe of recipes) {
    const recipeJson = recipesJson[recipe]

    const ingredients: Record<string, number> = {}
    for (const ingredient of recipeJson.ingredients) {
      ingredients[ingredient.key] = ingredient.amount
    }

    partialRecipeDescriptions[recipe] = {
      ingredients,
      rewards: recipeJson.reward,
    }
  }

  return partialRecipeDescriptions as Record<Recipe, RecipeDescription>
})()

export const buildingIngredients: Record<Building, string[]> = (() => {
  const buildingIngredientsAsSet: Partial<Record<Building, Set<string>>> = {}

  for (const [recipe, description] of Object.entries(recipeDescriptions)) {
    const building = recipeBuildings[recipe as Recipe]
    if (!buildingIngredientsAsSet[building])
      buildingIngredientsAsSet[building] = new Set()
    for (const item of Object.keys(description.ingredients)) {
      buildingIngredientsAsSet[building].add(item)
    }
  }

  const partialBuildingIngredients: Partial<Record<Building, string[]>> = {}
  for (const [building, ingredients] of Object.entries(
    buildingIngredientsAsSet,
  )) {
    partialBuildingIngredients[building as Building] = [...ingredients]
  }

  return partialBuildingIngredients as Record<Building, string[]>
})()
