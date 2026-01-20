import Uploader from "../utils/uploadProvider"
import {
    BadRequestError,
    EntityNotFoundError,
    InternalServerError,
    UnauthorizedError
} from "../errors/RequestErrorCollection";
import {NextFunction} from "express";
//import validation from "../utils/validation";
//import uploadProvider from "../utils/uploadProvider";

export async function uploadFiles(req: any, res: any, next: NextFunction) {


    req.info = {}
    req.info.entity = `files`
    Uploader.uploadMultiple(req, res, async (err: any) => {
        try {
            if (err) {
                //console.error(err)
                return next(new InternalServerError(err))
            } else {
                let files = req.files.map((f: any) => f.location)
                return res.send(files)
            }
        } catch (e: any) {
            return next(new InternalServerError(e))
        }
    })
}

export async function uploadSingleFile(req: any, res: any, next:NextFunction){


    req.info = {}
    req.info.entity = `file`
    Uploader.upload(req, res, async (err: any) => {
        if (err) {
            console.error(err)
            return next(new InternalServerError(err))
        } else {
            let url = req.file.location
            try {
                res.send({location : url})
            } catch (e: any) {
                return next(new InternalServerError(e))
            }
        }
    })
}

export async function uploadFilesPublic(req: any, res: any, next:NextFunction) {


    req.info = {}
    req.info.entity = `file`
    Uploader.upload_public_multi(req, res, async (err: any) => {
        try {
            if (err) {
                //console.error(err)
                return next(new InternalServerError(err))
            } else {
                let files = req.files?.map((f: any)=>f.location)
                return res.send(files)
            }
        } catch (e: any) {
            return next(new InternalServerError(e))
        }
    })
}


export async function uploadSingleFilePublicImage(req: any, res: any, next:NextFunction) {
    req.info = {}
    req.info.entity = `image`
    
    Uploader.upload_public_image(req, res, async (err: any) => {

        if (err) return next(new InternalServerError(err))
        
        if(!req.file)return next(new BadRequestError("File not uploaded"))
         
        
        let url = req.file.location
            try {
                res.send({location : url})
            } catch (e: any) {
                return next(new InternalServerError(e))
            }
    })
}

export async function uploadSingleFilePublic(req: any, res: any, next:NextFunction) {
    req.info = {}
    req.info.entity = `file`
    
    Uploader.upload_public(req, res, async (err: any) => {

        if (err) return next(err)
        
        if(!req.file)return next(new BadRequestError("File not uploaded"))
         
        
        let url = req.file.location
            try {
                res.send({location : url})
            } catch (e: any) {
                return next(new InternalServerError(e))
            }
    })
}


export async function download(req: any, res: any, next: NextFunction) {

    const key = req.body.url

    if(!key)
        return next(new BadRequestError("No url defined in the body request(req.body.url === undefined)"))

    const params = {
        Key: key,
        Bucket: process.env.SPACES_BUCKET_NAME
    }


    Uploader.s3.getObject(params, (err: any, data: any) => {
        if (err) {
            console.error(err)
            res.status(500).send({msg: err.message, code: err.code, time: err.time, status_code: err.statusCode})
        } else {
            let filename = key.split("/").pop()
            res.attachment(filename)
            res.send(data.Body)
        }
    })

}