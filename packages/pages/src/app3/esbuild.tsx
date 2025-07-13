declare const IS_DEVELOPMENT: boolean;

if (typeof IS_DEVELOPMENT !== 'undefined' && IS_DEVELOPMENT) {
  new EventSource('/esbuild').addEventListener('change', () => location.reload());
}
