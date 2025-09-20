import express from 'express'
import { auth } from '../middlewares/auth.js';
import { generateArticle, generateBlogTitle, generateImages, generatePrescription, removeImageBackground, removeImageObject, reviewResume } from '../controllers/aiController.js';
import { upload } from '../configs/multer.js';
const aiRouter = express.Router();
aiRouter.post("/generate-article", auth, generateArticle);
aiRouter.post("/generate-blog-title", auth, generateBlogTitle);
aiRouter.post("/generate-images", auth, generateImages);
aiRouter.post("/remove-image-background", upload.single('image'), auth, removeImageBackground);
aiRouter.post("/remove-image-object", upload.single("image"), removeImageObject);
aiRouter.post("/resume-review", upload.single('resume'), auth, reviewResume);
aiRouter.post("/generate-prescription", auth, generatePrescription);

export default aiRouter;