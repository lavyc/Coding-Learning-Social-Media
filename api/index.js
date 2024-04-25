//dependecies
import express  from "express";
const app = express();
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import friendshipRoutes from "./routes/friendships.js"
import adminRoutes from "./routes/admins.js"
import notificationRoutes from "./routes/notifications.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";

//middleware 
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);//able to send cookies
    next();
});
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173", //react application
}));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, '../client/public/upload')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage});

app.post("/api/upload", upload.single("file"), (req, res)=>{
    const file= req.file;
    res.status(200).json(file.filename)
})

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/friendship", friendshipRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admins", adminRoutes);

app.listen(8800, ()=>{
    console.log("Server running!");
});
