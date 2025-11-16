import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import myUserRoute from "./routes/MyUserRoute";
import { v2 as cloudinary } from "cloudinary";
import MyShopController from "./controllers/MyShopController";
import myShopRoute from "./routes/MyShopRoute";
import shopRoute from "./routes/ShopRoute"
import orderRoute from "./routes/OrderRoute"
import verificationRoute from "./routes/VerificationRoute";
import mfaRoute from "./routes/MfaRoute";
import photoRoute from "./routes/PhotoRoute";
import multer from "multer";
import fs from "fs"
import path from "path"

//Connecting to database
mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING as string)
    .then(() => console.log("Connected to database!"));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = 7000
app.use(express.json());
app.use(cors()); 

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get("/health", async (req: Request, res: Response) => {
    res.send({ message: "health OK!" });
})

app.use("/api/my/user", myUserRoute);
app.use("/api/my/shop", myShopRoute);
app.use("/api/shop", shopRoute);
app.use("/api/order", orderRoute);
app.use("/api/verification", verificationRoute);
app.use("/api/mfa", mfaRoute);
app.use("/api/my/user/photo", photoRoute);

interface MulterRequest extends Request {
    files: Express.Multer.File[]; // Typing for `req.files`
}

const photosMiddleware = multer({dest: 'uploads/'})
// Adjust the path to the 'uploads' directory
const uploadPath = path.resolve(__dirname, '..', 'uploads');
// console.log(uploadPath)

// Serve the files in the 'uploads' directory
app.use('/uploads', express.static(uploadPath))



//Retrieving Images from client and adding into 'uploads' folder
app.post('/uploads', photosMiddleware.array("photos", 100), (req: Request, res: Response) => {

    const uploadedFiles = []
    const multerReq = req as MulterRequest;
    if (!multerReq.files) {
        return res.status(400).send('No files were uploaded.');
      }

    try {
        console.log(multerReq.files) // Check if files are received
        for (let i=0; i < multerReq.files.length; i++){

            const {path, originalname} = multerReq.files[i]
            const parts = originalname.split('.')
            const ext = parts[parts.length - 1]
            const newPath = path + '.' + ext
            fs.renameSync(path, newPath)
            console.log(newPath)
            uploadedFiles.push(newPath.replace('uploads\\', ''))
            console.log(uploadedFiles)
        }
        res.status(200).json(uploadedFiles)
    } 
      
    catch (error) {
        console.error('Error processing files:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
})

// GET route for '/uploads'
app.get('/uploads', (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to list uploaded files' });
        }
        res.status(200).json(files);
    });
});

// GET route for individual files in '/uploads/:id'
app.get('/uploads/:id', (req, res) => {
    const fileId = req.params.id;
    const filePath = path.join(__dirname, 'uploads', fileId);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist:', filePath);
            return res.status(404).send('File not found');
        }
        res.sendFile(filePath);
    }); 
});

app.listen(port, () => {
    console.log(`Server started on localhost:${port}`);
});