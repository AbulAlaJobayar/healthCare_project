import  express  from 'express';
import { RagController } from './rag.controller';
const router = express.Router()

router.get('/stats',RagController.getStatus)


export const RagRouter= router;