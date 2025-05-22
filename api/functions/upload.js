"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commit = void 0;
const octokit_1 = require("octokit");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const file_type_1 = require("file-type");
require("dotenv/config");
const OctoWithPlugin = octokit_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
class Commit {
    constructor(githubUsername = process.env.GH_USN || "", octoConfig = new OctoWithPlugin({
        auth: process.env.GH_TOKEN || ""
    })) {
        this.githubUsername = githubUsername;
        this.octoConfig = octoConfig;
    }
    push(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = Buffer.from(file);
            const fileExtension = yield (0, file_type_1.fileTypeFromBuffer)(file);
            if (!fileExtension)
                throw new Error("File extension not supported");
            if (!["png", "jpg", "jpeg"].includes(fileExtension.ext))
                throw new Error("File extension not supported");
            const content = buffer.toString("base64");
            const fileName = `${Date.now().toString()}.${fileExtension.ext}`;
            try {
                const response = yield this.octoConfig.rest.repos.createOrUpdateFileContents({
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
        });
    }
}
exports.Commit = Commit;
