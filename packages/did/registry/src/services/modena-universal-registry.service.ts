import { Service } from "@quarkid/did-core";
import { IJWK } from "@quarkid/kms-core";
import { DIDDocumentMetadata, ModenaRequest, ModenaSdkConfig } from "@extrimian/modena-sdk";
import fetch from "node-fetch";
import { CreateDIDResponse } from "../models/create-did.response";
import { VerificationMethod } from "../models/interfaces";
import { PublishDIDRequest } from "../models/publish-did-request";
import { PublishDIDResponse } from "../models/publish-did.response";
import { UpdateDIDRequest } from "../models/update-did-request";
import { Did } from "./did.service";
import { ModenaRegistryBase } from "./modena-registry.service";

export class ModenaUniversalPublishRequest extends PublishDIDRequest {
    didMethod: string;
    universalResolverURL: string;
}


export class ModenaUniversalRegistry extends ModenaRegistryBase<ModenaUniversalPublishRequest> {

    async getSupportedDidMethods(universalRegistryUrl: string): Promise<string[]> {
        const options = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };

        const response = await fetch(`${universalRegistryUrl}/mappings`, options);

        if (response.status !== 200) {
            const msg = await response.json();
            throw new Error("Error getting mapping on node: " + JSON.stringify(msg))
        }

        const body = await response.json();

        return body.list.map(x => x.pattern) as string[];
    }


    async publishDID(request: ModenaUniversalPublishRequest): Promise<PublishDIDResponse> {
        ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes = 2000;
        if (!request.universalResolverURL) throw new Error("universalResolverURL is required when did method is defined");

        const input = {
            recoveryKeys: request.createDIDResponse.recoveryKeys,
            updateKeys: request.createDIDResponse.updateKeys,
            document: request.createDIDResponse.document
        };

        const createRequest = ModenaRequest.createCreateRequest(input);

        let url = `${request.universalResolverURL}/create`;
        let headers = {
            "Content-Type": "application/json",
        };

        if (request.apiKey && (request.apiKey.type == "queryParam" || !request.apiKey.type)) {
            url = `${url}?${request.apiKey.fieldName || "apikey"}=${request.apiKey.value}`;
        } else if (request.apiKey) {
            headers[request.apiKey.fieldName || "apikey"] = request.apiKey.value;
        };

        const options = {
            method: "POST",
            headers,
            body: JSON.stringify({
                modenaRequest: JSON.stringify(createRequest),
                didMethod: request.didMethod
            })
        };

        const response = await fetch(url, options);

        if (response.status !== 200 && response.status !== 201) {
            const msg = await response.json();
            throw new Error(`DID creation is not ok: ${msg}`);
        }
        const { canonicalId } = ((await response.json()) as any)
            .didDocumentMetadata;

        return {
            canonicalId: canonicalId.substring(canonicalId.lastIndexOf(":") + 1),
            did: canonicalId,
            longDid: canonicalId.substring(0, canonicalId.lastIndexOf(":")) + request.createDIDResponse.longDid.replace("did:", ":"),
        };
    }

    async updateDID(params: UpdateDIDRequest) {
        const request = await ModenaRequest.createUpdateRequest({
            nextUpdatePublicKeys: params.newUpdateKeys,
            documentMetadata: params.documentMetadata,
            updateKeysToRemove: params.updateKeysToRemove,
            didSuffix: params.didSuffix,
            updatePublicKey: params.updatePublicKey,
            signer: {
                async sign(header: object, content: object): Promise<string> {
                    return await params.signer(content);
                }
            },
            idsOfPublicKeysToRemove: params.idsOfVerificationMethodsToRemove,
            idsOfServicesToRemove: params.idsOfServiceToRemove,
            publicKeysToAdd: params.verificationMethodsToAdd,
            servicesToAdd: params.servicesToAdd
        });

        let url = `${params.updateApiUrl}/create`;
        let headers = {
            "Content-Type": "application/json",
        };

        if (params.apiKey && (params.apiKey.type == "queryParam" || !params.apiKey.type)) {
            url = `${url}?${params.apiKey.fieldName || "apikey"}=${params.apiKey.value}`;
        } else if (params.apiKey) {
            headers[params.apiKey.fieldName || "apikey"] = params.apiKey.value;
        };


        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        };

        const response = await fetch(url, options);

        if (response.status !== 200 && response.status !== 201) {
            const msg = await response.json();
            throw new Error(`DID update is not ok: ${msg}`);
        }
    }
}