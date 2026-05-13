<script lang="ts">
interface Props {
  level: number
  minLevel: number
  maxLevel: number
}
let { level = $bindable(), minLevel, maxLevel }: Props = $props()

function incrementLevel() {
  level = Math.min(level + 1, maxLevel)
}
function decrementLevel() {
  level = Math.max(level - 1, minLevel)
}
</script>

<div class="level-controller">
  <label for="level-input">Level:</label>
  <input id="level-input" type="number" min="{minLevel}" max="{maxLevel}" bind:value={level} />
  <button id="level-increment" onclick={incrementLevel}>+</button>
  <button id="level-decrement" onclick={decrementLevel}>-</button>

  <input id="level-range" type="range" min="{minLevel}" max="{maxLevel}" bind:value={level} />
</div>

<style>
    .level-controller {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        min-width: 16rem;
    }

  .level-controller > label {
      grid-column: 1;
      grid-row: 1;
  }

  .level-controller > #level-input {
      grid-column: 2;
      grid-row: 1;
  }

  .level-controller > #level-increment {
      grid-column: 3;
      grid-row: 1;
  }

  .level-controller > #level-decrement {
      grid-column: 4;
      grid-row: 1;
  }

  .level-controller > #level-range {
      grid-column: 1 / -1;
      grid-row: 2;
  }
</style>
