import { envVars } from "../../config/env";

export class EmbeddingServices {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private EmbeddingModel: string;

  constructor() {
    this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
    this.EmbeddingModel =
      envVars.RAG.OPENROUTER_EMBEDDINGS_MODEL ||
      "nvidia/llama-nemotron-embed-vl-1b-v2:free";
    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set in the environment variables.",
      );
    }
  }
}
