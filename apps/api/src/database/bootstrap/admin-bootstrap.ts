import "dotenv/config";
import AppDataSource from "../data-source";
import { bootstrapAdmin } from "./bootstrap-admin";

async function run() {
  await AppDataSource.initialize();
  try {
    const result = await bootstrapAdmin(AppDataSource, {
      name: process.env.DEFAULT_ADMIN_NAME,
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: process.env.DEFAULT_ADMIN_PASSWORD,
    });
    console.log(
      result.created
        ? "Administrador inicial criado."
        : "Administrador inicial já existe.",
    );
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Falha ao configurar o administrador inicial.",
  );
  process.exitCode = 1;
});
