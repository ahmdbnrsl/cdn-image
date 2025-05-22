const path = await import("path");
const exp = await import("express");
const multer = await import("multer");
const { Octokit } = await import("octokit");
const { restEndpointMethods } = await import("@octokit/plugin-rest-endpoint-methods");
const { fileTypeFromBuffer } = await import("file-type");
const dotenv = await import("dotenv");
dotenv.config();
/**
 *
 *
 * Configuration
 **/
const STORAGE_URL = process.env.STORAGE_URL || "";
const OctoWithPlugin = Octokit.plugin(restEndpointMethods);
const app = exp.default();
const multerDefault = multer.default;
app.use(exp.static(path.join(process.cwd(), "public")));
/**
 *
 *
 * Multer
 **/
const storage = multerDefault.memoryStorage();
const upload = multerDefault({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Hanya menerima file PNG dan JPEG."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
class Commit {
    constructor(githubUsername = process.env.GH_USN || "", octoConfig = new OctoWithPlugin({
        auth: process.env.GH_TOKEN || ""
    })) {
        this.githubUsername = githubUsername;
        this.octoConfig = octoConfig;
    }
    async push(file) {
        const buffer = Buffer.from(file);
        const fileExtension = await fileTypeFromBuffer(file);
        if (!fileExtension)
            throw new Error("File extension not supported");
        if (!["png", "jpg", "jpeg"].includes(fileExtension.ext))
            throw new Error("File extension not supported");
        const content = buffer.toString("base64");
        const fileName = `${Date.now().toString()}.${fileExtension.ext}`;
        try {
            const response = await this.octoConfig.rest.repos.createOrUpdateFileContents({
                owner: this.githubUsername,
                repo: "storage",
                path: `storage/${fileName}`,
                message: Date.now().toString(),
                content
            });
            return {
                status: true,
                code: response.status,
                id: fileName
            };
        }
        catch (err) {
            return {
                status: false,
                errorMessage: err
            };
        }
    }
}
/**
 * Routes
 *
 *
 **/
app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Tidak ada foto yang di upload"
        });
    }
    else {
        const buffer = req.file.buffer;
        const commit = new Commit();
        const response = await commit.push(buffer);
        res.status(response.status ? 200 : 500).json(response);
    }
});
app.get("/file/:fileid", async (req, res) => {
    var _a;
    const fileId = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.fileid;
    if (!fileId) {
        res.status(404).json({
            status: false,
            code: 404,
            message: "Not Found"
        });
    }
    else {
        const response = await fetch(STORAGE_URL + fileId);
        if (!(response === null || response === void 0 ? void 0 : response.ok)) {
            res.status(404).json({
                status: false,
                code: 404,
                message: "Not Found"
            });
        }
        else {
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
