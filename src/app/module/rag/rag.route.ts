import  express  from 'express';
import { RagController } from './rag.controller';
const router = express.Router()

router.get('/stats',RagController.getStatus)
router.post('/ingest-doctor',RagController.IngestDoctorData)


export const RagRouter= router;