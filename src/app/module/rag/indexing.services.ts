import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingServices } from "./embedding.services";

export class IndexingServices {
  private embeddingService: EmbeddingServices;
  constructor() {
    this.embeddingService = new EmbeddingServices();
  }
  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    content: string,
    sourceLabel: string,
    metadata: Record<string, unknown>,
  ) {
    try {
      // Implementation for indexing a document
      console.log("Indexing document...");
      // Add indexing logic here
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = `[${embedding.join(",")}]`;
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "document_embeddings" ("id","chunkKey","sourceType", "sourceId", "sourceLabel","content", "metadata", "embedding", "updatedAt")
        VALUES (${Prisma.raw("gen_random_uuid()")},${chunkKey}, ${sourceType},${sourceId},${sourceLabel || null}, ${content}, ${JSON.stringify(metadata || {})}:: jsonb, CAST(${vectorLiteral} AS vector), NOW())
        ON CONFLICT ("chunkKey")
        DO UPDATE SET
            "sourceType" = EXCLUDED."sourceType",
            "sourceId" = EXCLUDED."sourceId",
            "sourceLabel" = EXCLUDED."sourceLabel",
            "content" = EXCLUDED."content",
            "metadata" = EXCLUDED."metadata",
            "embedding" = EXCLUDED."embedding",
            "isDeleted" = false,
            "deletedAt" = NULL,
            "updatedAt" = NOW()
      `);
      console.log("Document indexed successfully.");
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to index document: ${error}`);
    }
  }
  async indexDoctorData() {
    // Implementation for indexing doctor data
    try {
      console.log("first");
      const doctors = await prisma.doctor.findMany({
        where: {
          isDeleted: false,
        },
        include: {
          specialties: {
            include: {
              specialty: true,
            },
          },
          reviews: true,
        },
      });
      let indexCount = 0;
      for (const doctor of doctors) {
        // formate Spacialittes
        const specialities = doctor.specialties
          .map(({ specialty }) => specialty.title)
          .join("\n");
        // formate Review
        const reviewsText = doctor.reviews.map(
          (r) =>
            `_ Rating: ${r.rating}/5 , comment:${r.comment}|| "No Comment"`,
        );
        const content = `
        Doctor Name: ${doctor.name}
        experience: ${doctor.experience} years
        Qualifications: ${doctor.qualification} 
        Designation: ${doctor.designation}
        Appoinment Fee: ${doctor.appointmentFee}
        Current Working Place: ${doctor.currentWorkingPlace}
        Avarage Rating: ${doctor.averageRating}/5
        Spacialities: ${specialities || "None Listed"}
        Patient Reviews: ${reviewsText.length > 0 ? reviewsText.join("\n") : "No Reviews"}

        `;
        const metadata = {
          doctorId: doctor.id,
          name: doctor.name,
          specialities: doctor.specialties.map((ds) => ds.specialty.title),
          avarageRating: doctor.averageRating,
          experience: doctor.experience,
        };
        const chunkKey = `doctor-${doctor.id}`;
        await this.indexDocument(
          chunkKey,
          "Doctor",
          doctor.id,
          content,
          doctor.name,
          metadata,
        );
        indexCount++;
        return {
          success: true,
          message: `${indexCount} doctors indexed successfully`,
          indexCount,
        };
      }
      console.log("sussesfully index ");
    } catch (error) {
      console.log(error);
      throw new Error(`Failed to index doctor data: ${error}`);
      
    }
  }
}
