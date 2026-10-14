import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RAGServices } from "./rag.services";
import { redisService } from "../../lib/redis";
const ragService = new RAGServices();
const getStatus = catchAsync(async (req: Request, res: Response) => {
  res.status(httpStatus.OK);
  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "RAG status fetched successfully",
    data: {
      status: "OK",
    },
  });
});

const IngestDoctorData = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.ingestDoctorData();

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Doctor data ingested successfully",
    data: result,
  });
});
const queryRag = catchAsync(async (req: Request, res: Response) => {
  const { query, limit, sourceType } = req.body;
  if (!query) {
    return sendResponse(res, {
      httpStatusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Query is required",
    });
  }
  // cache hit
  // generate Cache key from query param
  const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || "all"}`;

  try {
    const cacheResult = await redisService.get(cacheKey);
    if (cacheResult) {
      const parseData = JSON.parse(cacheResult);
      sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success: true,
        message: "answeer retrive from cache",
        data: parseData,
      });
      return;
    }
  } catch (error) {
    console.warn(" cache read Error, procedding with normal processing", error);
  }
  const result = await ragService.generateAnsware(query, limit, sourceType);

  // cache miss
try {
  await redisService.set(cacheKey, JSON.stringify(result), 5);
} catch (error) {
  console.warn(" cache write error",error)
}

  sendResponse(res, {
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Doctor data ingested successfully",
    data: result,
  });
});

export const RagController = {
  getStatus,
  IngestDoctorData,
  queryRag,
};
