import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

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

const IngestDoctorData = catchAsync(async(req:Request,res:Response)=>{
const result = await RagService.ingestDoctorData(req.body);

 sendResponse(res,{
    httpStatusCode: httpStatus.OK,
    success: true,
    message: "Doctor data ingested successfully",   
    data:result
 })   
})
  
  
export const RagController = {
  getStatus,
  IngestDoctorData,
};