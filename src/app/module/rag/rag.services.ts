import { LLMServices } from "./llm.services";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbeddingServices } from "./embedding.services";
import { IndexingServices } from "./indexing.services";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export class RAGServices {
  private embeddingService: EmbeddingServices;
  private llmService: LLMServices;
  private indexingService: IndexingServices;

  constructor() {
    this.embeddingService = new EmbeddingServices();
    this.llmService = new LLMServices();
    this.indexingService = new IndexingServices();
  }
  async ingestDoctorData() {
    return await this.indexingService.indexDoctorData();
  }

  async releventsDocuments(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    // Generate embedding for the query
    try {
      console.log("start documents finding");
      const queryEmbedding =
        await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;
      const results = await prisma.$queryRaw(Prisma.sql`
  SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, embedding, "createdAt","updatedAt", "isDeleted", "deletedAt", 1-(embedding <=> CAST(${vectorLiteral} AS vector)) AS similarity
  FROM "document_embeddings"
  WHERE "isDeleted" = false
  ${sourceType ? Prisma.sql`AND "sourceType"=${sourceType}` : Prisma.empty}
  ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
  Limit ${limit}
`);
      return results;
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to retrieve relevant documents: ${error}`);
    }
  }

  async generateAnsware(
    query: string,
    limit: number = 5,
    sourceType?: string,
    asJson: boolean = true,
  ) {
    // Generate embedding for the query
    try {
      const releventDoc: any = await this.releventsDocuments(
        query,
        limit,
        sourceType,
      );
      // exterct contenct from documents from content
      const context = releventDoc
        .filter((doc: any) => doc.content)
        .map((doc: any) => doc.content);
      let ans = await this.llmService.generateAnswer(query, context, asJson);

      let parseAns: any = ans;
      if (asJson) {
        try {
          if (ans.startsWith("```json")) {
            ans = ans
              .replace(/```json\n?/, "")
              .replace(/```$/, "")
              .trim();
          } else if (ans.startsWith("```")) {
            ans = ans
              .replace(/```\n?/, "")
              .replace(/```$/, "")
              .trim();
          }
          parseAns = JSON.parse(ans);
        } catch (error) {
          console.log(error);
        }
      }
       return {
         answer: parseAns,
         sources: (releventDoc as any).map((doc: any) => ({
           id: doc.id,
           chunkKey: doc.chunkKey,
           sourceType: doc.sourceType,
           sourceId: doc.sourceId,
           sourceLabel: doc.sourceLabel,
           content: doc.content,
           similarity: doc.similarity,
         })),
         contextUsed: context.length > 0,
       };
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to generate answer: ${error}`);
    }
  }
}
