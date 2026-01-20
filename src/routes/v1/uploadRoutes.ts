import { Router } from "express";
import * as uploadController from "../../controllers/uploadController";
import auth from "../../middlewares/auth";

const router = Router();


router.post("/public/file", uploadController.uploadSingleFilePublic);
router.post("/public/image", uploadController.uploadSingleFilePublicImage);
router.post("/public/3dfile", auth.admin, uploadController.uploadSingleFilePublic);

export default router;