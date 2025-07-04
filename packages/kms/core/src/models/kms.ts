import { DIDCommMessage, Purpose } from "@quarkid/did-core";
import { VerifiableCredential } from "@quarkid/vc-core";
import { IJWK } from "../utils/base-converter";
import { IKeyPair } from "./keypair";
import { DIDCommMessagePacking, IDIDCommMessage, IPackedDIDCommMessage } from "./suites/didcomm/didcomm-message-media-type";
import { DIDCommPackedMessage } from "./suites/didcomm/didcomm-packed-message";
import { Suite } from "./supported-suites";

export interface IKMS {
    create(suite: Suite): Promise<{ publicKeyJWK: IJWK }>;
    sign(suite: Suite, publicKeyJWK: IJWK, content: any): Promise<string>;
    verifySignature(publicKeyJWK: IJWK, originalContent: string, signature: string): Promise<boolean>;
    signVC(suite: Suite,
        publicKeyJWK: IJWK,
        vc: any,
        did: string,
        verificationMethodId: string,
        purpose: Purpose): Promise<VerifiableCredential>;
    signVCPresentation(params: {
        publicKeyJWK: IJWK,
        presentationObject: any, 
        did: string,
        verificationMethodId: string,
        purpose: Purpose
    }): Promise<any>;
    deriveVC(params: { vc: VerifiableCredential, frame: any }): Promise<VerifiableCredential>;
    pack(publicKeyJWK: IJWK, toHexPublicKeys: string[], contentToSign: string): Promise<string>;
    packv2(publicKeyJWK: IJWK,
        senderVerificationMethodId: string,
        toHexPublicKeys: string[],
        message: IDIDCommMessage,
        packing: DIDCommMessagePacking): Promise<IPackedDIDCommMessage>;
    packDIDCommV2(params: {
        senderVerificationMethodId?: string,
        recipientVerificationMethodIds: string[],
        message: IDIDCommMessage,
        packing: DIDCommMessagePacking
    }): Promise<{ packedMessage: any | DIDCommPackedMessage }>;
    unpack(publicKeyJWK: IJWK, packedContent: string): Promise<string>;
    unpackv2(publicKeyJWK: IJWK, jwe: any): Promise<string>;
    unpackvDIDCommV2(receiptDID: string, packedMessage: any | DIDCommPackedMessage): Promise<{ message: DIDCommMessage, metaData: { packing: DIDCommMessagePacking } }>;
    export(publicKeyJWK: IJWK): Promise<any>;
    import(key: {
        publicKeyHex: string,
        secret: IKeyPair
    }): Promise<void>;
    getPublicKeysBySuiteType(suite: Suite): Promise<IJWK[]>;
    getAllPublicKeys(): Promise<IJWK[]>;
}