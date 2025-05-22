import { Octokit } from "octokit";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { fileTypeFromBuffer } from "file-type";
import * as fs from "fs";
import "dotenv/config";

const OctoWithPlugin = Octokit.plugin(restEndpointMethods);

interface IResult {
    status: boolean;
    code?: number;
    id?: string;
    errorMessage?: string;
}

export class Commit {
    constructor(
        private githubUsername: string = process.env.GH_USN || "",
        private octoConfig: typeof OctoWithPlugin = new OctoWithPlugin({
            auth: process.env.GH_TOKEN || ""
        })
    ) {}

    async push(file: Buffer): Promise<IResult> {
        const buffer = Buffer.from(file);
        const fileExtension = await fileTypeFromBuffer(file);

        if (!fileExtension) throw new Error("File extension not supported");
        if (!["png", "jpg", "jpeg"].includes(fileExtension.ext))
            throw new Error("File extension not supported");

        const content = buffer.toString("base64");
        const fileName = `${Date.now().toString()}.${fileExtension.ext}`;
        try {
            const response =
                await this.octoConfig.rest.repos.createOrUpdateFileContents({
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
        } catch (err) {
            return {
                status: false,
                errorMessage: err as string
            };
        }
    }
}
