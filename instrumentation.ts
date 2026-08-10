export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.NODE_ENV !== "development"
  ) {
    return;
  }

  // webpackIgnore: keep undici as a Node runtime import (not bundled for the client)
  const { Agent, setGlobalDispatcher } = await import(
    /* webpackIgnore: true */ "undici"
  );

  setGlobalDispatcher(
    new Agent({
      connect: { timeout: 30_000 },
    }),
  );
}
