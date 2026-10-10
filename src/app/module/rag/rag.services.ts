export class RAGServices{
    private embeddingService:EmbeddingServices;
    private llmService:LLMServices;
    private indexingService:IndexingServices;
    constructor(){
        this.embeddingService=new EmbeddingServices;
        this.llmService=new LLMServices();
        this.indexingService=new IndexingServices();
    }

}