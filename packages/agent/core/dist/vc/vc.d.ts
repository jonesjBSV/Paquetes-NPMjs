import { CredentialDisplay, IssuerData, VerifiableCredentialWithInfo } from "@quarkid/agent/src/vc/protocols/waci-protocol";
import { Purpose } from "@quarkid/did-core";
import { IJWK, IKMS } from "@quarkid/kms-core";
import { VerifiableCredential } from "@quarkid/vc-core";
import { VCSuiteError } from "@extrimian/vc-verifier";
import { CredentialManifestStyles, PresentationDefinitionFrame } from "@extrimian/waci";
import { Messaging } from "../messaging/messaging";
import { AgentIdentity } from "../models/agent-identity";
import { AgentPublicKey } from "../models/agent-pbk";
import { IAgentResolver } from "../models/agent-resolver";
import { IStorage } from "../models/agent-storage";
import { DID } from "../models/did";
import { ITransport } from "../models/transports/transport";
import { AgentTransport } from "../transport/transport";
import { LiteEvent } from "../utils/lite-event";
import { CredentialFlow } from "./models/credentia-flow";
import { VCCreateKeyRequest } from "./models/vc-create-key-request";
import { ActorRole, VCProtocol } from "./protocols/vc-protocol";
import { IStatusListAgentPlugin } from "../plugins/istatus-list-plugin";
export declare class VC {
    private transports;
    private kms;
    private resolver;
    private identity;
    private agentStorage;
    private vcStorage;
    private vcProtocols;
    private verificationRules;
    private readonly onCredentialArrived;
    get credentialArrived(): import("../utils/lite-event").ILiteEvent<{
        credentials: VerifiableCredentialWithInfo[];
        issuer: IssuerData;
        messageId: string;
    }>;
    private readonly onCredentialPresented;
    get credentialPresented(): import("../utils/lite-event").ILiteEvent<{
        vcVerified: boolean;
        presentationVerified: boolean;
        vc: VerifiableCredential<any>;
    }>;
    protected readonly onPresentationVerified: LiteEvent<{
        verified: boolean;
        vcs: VerifiableCredential[];
        thid: string;
        messageId: string;
    }>;
    get presentationVerified(): import("../utils/lite-event").ILiteEvent<{
        verified: boolean;
        vcs: VerifiableCredential<any>[];
        thid: string;
        messageId: string;
    }>;
    private readonly onCredentialIssued;
    get credentialIssued(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
        to: DID;
        invitationId?: string;
    }>;
    protected readonly onAckCompleted: LiteEvent<{
        role: ActorRole;
        status: string;
        messageId: string;
        thid: any;
        invitationId?: string;
    }>;
    get ackCompleted(): import("../utils/lite-event").ILiteEvent<{
        role: ActorRole;
        status: string;
        messageId: string;
        thid: any;
        invitationId?: string;
    }>;
    protected readonly onProblemReport: LiteEvent<{
        did: DID;
        code: string;
        invitationId: string;
        messageId: string;
    }>;
    get problemReport(): import("../utils/lite-event").ILiteEvent<{
        did: DID;
        code: string;
        invitationId: string;
        messageId: string;
    }>;
    protected readonly onBeforeSigningVC: LiteEvent<{
        vc: VerifiableCredential;
        issuerDID: DID;
    }>;
    get beforeSigningVC(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
        issuerDID: DID;
    }>;
    protected readonly onBeforeSaveVC: LiteEvent<{
        vc: VerifiableCredential;
    }>;
    get beforeSaveVC(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
    }>;
    protected readonly onAfterSaveVC: LiteEvent<{
        vc: VerifiableCredential;
    }>;
    get afterSaveVC(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
    }>;
    protected readonly onBeforeVerifyVC: LiteEvent<{
        vc: VerifiableCredential;
    }>;
    get beforeVerifyVC(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
    }>;
    protected readonly onAfterVerifyVC: LiteEvent<{
        vc: VerifiableCredential;
        verifierDID: DID;
        result: boolean;
    }>;
    get afterVerifyVC(): import("../utils/lite-event").ILiteEvent<{
        vc: VerifiableCredential<any>;
        verifierDID: DID;
        result: boolean;
    }>;
    protected credentialStatusPlugins: IStatusListAgentPlugin[];
    constructor(opts: {
        transports: AgentTransport;
        vcProtocols: VCProtocol[];
        kms: IKMS;
        resolver: IAgentResolver;
        identity: AgentIdentity;
        agentStorage: IStorage;
        vcStorage: IStorage;
        messaging: Messaging;
        verificationRules: ((vc: VerifiableCredential) => Promise<{
            result: boolean;
            rejectDetail?: {
                name: string;
                description: string;
                code: number;
            };
        }>)[];
    });
    addCredentialStatusStrategy(credentialStatusStrategy: IStatusListAgentPlugin): void;
    saveCredential(vc: VerifiableCredential): Promise<void>;
    saveCredentialWithInfo(vc: VerifiableCredential, params?: {
        styles: CredentialManifestStyles;
        display: CredentialDisplay;
    }): Promise<void>;
    removeCredential(id: string): Promise<void>;
    getVerifiableCredentials(): Promise<VerifiableCredential[]>;
    getVerifiableCredentialsWithInfo(): Promise<{
        data: VerifiableCredential;
        styles: CredentialManifestStyles;
        display: CredentialDisplay;
    }[]>;
    getVerifiableCredentialsByType(types: string[]): Promise<VerifiableCredential[]>;
    createKey(params: VCCreateKeyRequest): Promise<AgentPublicKey>;
    getKeys(): Promise<AgentPublicKey[]>;
    getKey(jwk: IJWK): Promise<AgentPublicKey>;
    signVC<VCType = any>(opts: {
        credential: VerifiableCredential;
        publicKey?: IJWK;
        purpose?: Purpose;
        did?: DID;
    }): Promise<VerifiableCredential<VCType>>;
    signPresentation(params: {
        contentToSign: string;
        challenge: string;
        domain: string;
        publicKey?: IJWK;
        purpose?: Purpose;
        did?: DID;
    }): Promise<any>;
    sendVC(params: {
        vc: VerifiableCredential;
        to: DID;
        preferredTransportClassRef?: new (params: any) => ITransport;
    }): Promise<void>;
    verifyVC(params: {
        vc: VerifiableCredential;
        purpose?: Purpose;
    }): Promise<{
        result: boolean;
        error?: VCSuiteError;
    }>;
    verifyPresentation(params: {
        presentation: any;
        challenge: string;
    }): Promise<{
        result: boolean;
        error?: VCSuiteError;
    }>;
    verifyPresentation(params: {
        presentation: any;
        purpose: Purpose;
    }): Promise<{
        result: boolean;
        error?: VCSuiteError;
    }>;
    createInvitationMessage(args: {
        path?: string;
        flow: CredentialFlow;
        did?: DID;
    }, outParam?: {
        invitationId: string;
    }): Promise<string>;
    processMessage(params: {
        message: any;
        did?: DID;
        transport?: ITransport;
        contextMessage?: any;
    }): Promise<void>;
    private getValidVerificationMethodSigner;
    deriveVC(params: {
        vc: VerifiableCredential;
        deriveProofFrame: PresentationDefinitionFrame;
    }): Promise<VerifiableCredential<any>>;
}
