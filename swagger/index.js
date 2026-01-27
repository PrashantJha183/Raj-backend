import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, "./swagger.yaml"));

export const swaggerServe = swaggerUi.serve;

export const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customSiteTitle: "E-Commerce API Docs",
});
