import { EmbeddingServices } from "./embedding.services";

export class IndexingServicesw{
    private embeddingService:EmbeddingServices;
    constructor(){
        this.embeddingService=new EmbeddingServices();
    }
}