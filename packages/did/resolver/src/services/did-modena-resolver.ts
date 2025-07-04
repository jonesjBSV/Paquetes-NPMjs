import { DIDDocument } from "@quarkid/did-core";
import axios from "axios";
import { ModenaResponse } from "../models/modena-response";

export class DIDModenaResolver {
    constructor(private config: {
        modenaURL: string,
        apiKey?: {
            fieldName?: string,
            value: string,
            type?: "header" | "queryParam"
        }
    }) {
        if (config.apiKey) {
            config.apiKey.fieldName = config.apiKey.fieldName || "apikey";
            config.apiKey.type = config.apiKey.type || "queryParam";
        }
    }

    async resolveDID(uniqueSuffix: string): Promise<DIDDocument> {
        let headers;
        let url = `${this.config.modenaURL}/resolve/${uniqueSuffix}`;

        if (this.config.apiKey?.type == "queryParam") {
            url = `${url}?${this.config.apiKey.fieldName}=${this.config.apiKey.value}`;
        } else if (this.config.apiKey?.type == "header") {
            headers = {
                [this.config.apiKey.fieldName]: this.config.apiKey.value
            };
        }

        const result = await axios.get(url, {
            headers: headers
        });

        if (typeof result.data === "string" && result.data.toLocaleLowerCase() == "did not found") {
            return null;
        }

        return result.data;
    }

    async resolveDIDWithMetadata(did: string): Promise<ModenaResponse> {
        let headers;
        let url = `${this.config.modenaURL}/1.0/identifiers/${did}`;

        if (this.config.apiKey?.type == "queryParam") {
            url = `${url}?${this.config.apiKey.fieldName}=${this.config.apiKey.value}`;
        } else if (this.config.apiKey?.type == "header") {
            headers = {
                [this.config.apiKey.fieldName]: this.config.apiKey.value
            };
        }

        const result = await axios.get(url, {
            headers: headers
        });



        if (typeof result.data === "string" && result.data.toLocaleLowerCase() == "did not found") {
            return null;
        }

        return result.data;
    }
}