<script>
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
</script>

<svelte:head>
  <title>Page not found · Transportation Behavior Lab</title>
</svelte:head>

<section class="wrap err">
  <p class="meta">Error {$page.status}</p>
  <h1>That page is not on the network.</h1>
  <p class="lede">
    {$page.error?.message ?? 'The link may be out of date, or the page may have moved.'}
  </p>
  <div class="err__actions">
    <a class="btn btn--primary" href={resolve('/')}>Back to the home page</a>
    <a class="btn btn--outline" href={resolve('/publications/')}>Browse publications</a>
  </div>
</section>

<style>
  .err {
    padding-block: clamp(4rem, 10vw, 8rem);
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    align-items: flex-start;
  }

  .err__actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0.8rem;
  }
</style>
