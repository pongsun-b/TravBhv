<script>
  // Tokens first, then the base layer, then the two licensed typefaces.
  import '$lib/tokens.css';
  import '../app.css';

  import '@fontsource/instrument-sans/400.css';
  import '@fontsource/instrument-sans/500.css';
  import '@fontsource/instrument-sans/600.css';
  import '@fontsource/jetbrains-mono/400.css';
  import '@fontsource/jetbrains-mono/500.css';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();
</script>

<a class="skip-link" href="#main">Skip to content</a>

<Header />

<main id="main">
  {@render children()}
</main>

<Footer />
