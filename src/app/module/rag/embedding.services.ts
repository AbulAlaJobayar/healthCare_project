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
  async generateEmbedding(content: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.EmbeddingModel,
          input: content,
          dimensions: 1536,
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to generate embedding: ${response.status} ${response.statusText}`,
        );
      }
      const data = await response.json();
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error("Invalid response format from embedding API.");
      }
      return data.data[0].embedding;
    } catch (error) {
      console.log(error);
    throw new Error(`Failed to index doctor data: ${error}`);
    }
  }
}
