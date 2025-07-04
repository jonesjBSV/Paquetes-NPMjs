import { Service } from "@quarkid/did-core";
import { IJWK } from "@quarkid/kms-core";
import { DIDDocumentMetadata } from "@extrimian/modena-sdk";
import { VerificationMethod } from "./interfaces";
export type UpdateDIDRequest = {
    apiKey?: {
        fieldName?: string;
        value: string;
        type?: "header" | "queryParam";
    };
    updateApiUrl: string;
    didSuffix: string;
    signer: (content: any) => Promise<string>;
    updatePublicKey: IJWK;
    newUpdateKeys?: IJWK[];
    updateKeysToRemove?: {
        publicKeys?: IJWK[];
        updateCommitment?: string[];
    };
    documentMetadata: DIDDocumentMetadata;
    verificationMethodsToAdd?: VerificationMethod[];
    idsOfVerificationMethodsToRemove?: string[];
    servicesToAdd?: Service[];
    idsOfServiceToRemove?: string[];
};
