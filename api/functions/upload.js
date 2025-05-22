const { Octokit } = await import("octokit");
const { restEndpointMethods } = await import("@octokit/plugin-rest-endpoint-methods");
const { fileTypeFromBuffer } = await import("file-type");
const dotenv = await import("dotenv");
dotenv.config();
const OctoWithPlugin = Octokit.plugin(restEndpointMethods);
export class Commit {
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
