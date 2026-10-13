/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";

export class LLMServices {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private model: string;

  constructor() {
    this.apiKey = envVars.RAG.OPENROUTER_API_KEY || " ";
    this.model =
      envVars.RAG.OPENROUTER_LLM_MODEL ||
      "nvidia/nemotron-3-super-120b-a12b:free";

    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set in the environment variables.",
      );
    }
  }
  async generateAnswer(
    prompt: string,
    context: string[],
    asJson: boolean = false,
  ) {
    try {
      // Answer implement
      let fullPrompt =
        context.length > 0
          ? `context information:\n${context.join("\n\n")}\n\nQusetion: ${prompt}\n\nAnswer based on the context above.`
          : prompt;
      if (asJson) {
        fullPrompt += `\n\nReturn only valid JSON object matching this structure {"doctor":[{"name":"doctor name", "reason":"why they are suitable", "speciality":"their speciality"}]} do not include any markdown formatting like \`\`\`json. `;
      }
      const systemMessage = asJson
        ? "you are a helpful assistent for a healthcare management system. answer the question besed on provided context. You MUST response only valid json format do not include markdown tags"
        : "you are a helpful assistent for a healthcare management system. answer the question besed on provided context. if the context does not contant the answer, say you do not have enough information";

      const bodyPayload: any = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      };
      if (
        asJson &&
        (this.model.includes("gpt") || this.model.includes("openai"))
      ) {
        bodyPayload.response_formate = { type: "json_object" };
      }
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          HTTP_Referer: "https://healthcare-management.local",
          "X-Title": "Healthcare Management System",
        },
        body: JSON.stringify(bodyPayload),
      });
     
      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          `Openrouter Api Error ${response?.status}-${errorData?.error?.message}`,
        );
      }
      const result = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to search data: ${error}`);
    }
  }
}
