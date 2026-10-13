import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RAGServices } from "./rag.services";
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
  const {query}=req.body;
  if(!query){
    return sendResponse(res, {
      httpStatusCode: httpStatus.BAD_REQUEST, 
      success: false,
      message: "Query is required",
    });
  }
  const result = await ragService.generateAnsware(query);
console.log(result,"😋😶")
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
