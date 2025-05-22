const path = await import("path");
const { Commit } = await import(
    path.join(process.cwd(), "api/functions", "upload.js")
);
const exp = await import("express");
const multer = await import("multer");
const dotenv = await import("dotenv");
dotenv.config();

const STORAGE_URL = process.env.STORAGE_URL || "";

const app = exp.default();
const multerDefault = multer.default;
app.use(exp.static(path.join(process.cwd(), "public")));

const storage = multerDefault.memoryStorage();
const upload = multerDefault({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya menerima file PNG dan JPEG."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Tidak ada foto yang di upload"
        });
    } else {
        const buffer = req.file.buffer;
        const commit = new Commit();
        const response = await commit.push(buffer);
        res.status(response.status ? 200 : 500).json(response);
    }
});

app.get("/file/:fileid", async (req, res) => {
    const fileId = req?.params?.fileid;
    if (!fileId) {
        res.status(404).json({
            status: false,
            code: 404,
            message: "Not Found"
        });
    } else {
        const response = await fetch(STORAGE_URL + fileId);

        if (!response?.ok) {
            res.status(404).json({
                status: false,
                code: 404,
                message: "Not Found"
            });
        } else {
            const image = await response.arrayBuffer();
            const buffer = Buffer.from(image);
            res.send(buffer);
        }
    }
});

app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        code: 404,
        message: "Not Found"
    });
});

app.listen(8000, () => {
    console.log("App is running...");
});

export {};
