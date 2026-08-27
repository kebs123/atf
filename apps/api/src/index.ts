import { createApp } from "./app";
import { env } from "./config/env";
import { initDb } from "./db";

async function main(): Promise<void> {
  await initDb();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Kebs API listening on http://localhost:${env.port}`);
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
