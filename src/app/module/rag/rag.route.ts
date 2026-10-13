import  express  from 'express';
import { RagController } from './rag.controller';
const router = express.Router()

router.get('/stats',RagController.getStatus)
router.post('/ingest-doctor',RagController.IngestDoctorData)
router.post('/query',RagController.queryRag)

export const RagRouter= router;