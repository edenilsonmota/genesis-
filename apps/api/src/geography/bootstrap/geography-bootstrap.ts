import "dotenv/config";
import AppDataSource from "../../database/data-source";
import { syncGeography } from "./sync-geography";

async function run() {
  await AppDataSource.initialize();
  try {
    const result = await syncGeography(AppDataSource);
    console.log(
      `Geografia sincronizada: ${result.states} estados e ${result.cities} cidades.`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}
run().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Falha ao sincronizar geografia.",
  );
  process.exitCode = 1;
});
