- look for `'initi' + 'alize'` (`game.b`)
- store the big object that gets `'recip' + 'es'`
- grab `*.recipes._recipes` for crafting ingredients
- grab `*.experience._config.levels` for level unlocks
- grab `*.buildings._buildingConfigs`, turn the `Map` into an object where `nameKey` is the key and `availableRecipes` is the value, if it exists and `isWorkshop` is true and `nameKey` is the same as key

```js
let result = {}
globalThis.game.buildings._buildingConfigs.forEach((v, k) => {
    if(v.nameKey === k && v.isWorkshop) result[k] = v.availableRecipes;
})
```

data last fetched for 1.76.0-9
