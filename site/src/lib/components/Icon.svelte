<script>
  // Minimal monoline icon set, 24x24 grid, currentColor.
  // One family, one stroke weight - no emoji, no mixed icon sources.
  let { name, size = 18, stroke = 1.7, class: cls = '' } = $props();

  const paths = {
    'arrow-right': ['M5 12h13', 'M13 6l6 6-6 6'],
    'arrow-up-right': ['M7 17L17 7', 'M8 7h9v9'],
    'chevron-down': ['M6 9l6 6 6-6'],
    'chevron-right': ['M9 6l6 6-6 6'],
    menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
    close: ['M6 6l12 12', 'M18 6L6 18'],
    sun: [
      'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
      'M12 2v2',
      'M12 20v2',
      'M4.9 4.9l1.4 1.4',
      'M17.7 17.7l1.4 1.4',
      'M2 12h2',
      'M20 12h2',
      'M4.9 19.1l1.4-1.4',
      'M17.7 6.3l1.4-1.4'
    ],
    moon: ['M20.5 14.6A8.4 8.4 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z'],
    mail: ['M3 6.5h18v11H3z', 'M3.6 7.2L12 13l8.4-5.8'],
    phone: [
      'M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z'
    ],
    pin: ['M12 21.5s7-5.9 7-11.4a7 7 0 1 0-14 0c0 5.5 7 11.4 7 11.4z', 'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
    file: ['M13.5 3.5H7a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8z', 'M13.5 3.5V8H18'],
    download: ['M12 4v11.5', 'M7.5 11l4.5 4.5 4.5-4.5', 'M5 20h14'],
    users: [
      'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
      'M3.5 20a5.5 5.5 0 0 1 11 0',
      'M16.5 11a3 3 0 1 0 0-6',
      'M17 20a5.5 5.5 0 0 0-2-4.2'
    ],
    chart: ['M4 20V5', 'M4 20h16', 'M8.5 20v-6', 'M12.5 20v-10', 'M16.5 20v-3.5'],
    reset: ['M4.5 5.5v5h5', 'M19.5 18.5v-5h-5', 'M19 9.5A7.6 7.6 0 0 0 5.2 8', 'M5 14.5A7.6 7.6 0 0 0 18.8 16'],
    check: ['M5 12.5l4.5 4.5L19 7'],
    route: ['M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M6 13V9a2 2 0 0 1 2-2h6']
  };

  let d = $derived(paths[name] ?? []);
</script>

<svg
  class="ico {cls}"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={stroke}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
>
  {#each d as p}
    <path d={p} />
  {/each}
</svg>

<style>
  .ico {
    display: block;
  }
</style>
