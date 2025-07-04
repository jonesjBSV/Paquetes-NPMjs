import { Purpose } from "@quarkid/did-core";
import { IJWK } from "@quarkid/kms-core";

export interface ProcessResult {
    canonicalId: string;
    recoveryKey: any[];
    updateKey: any[];
    didCommKey: any;
    bbsBls2020Key: any;
}

export interface IPublicKeys {
    recoveryKey?: IJWK[];
    updateKey?: IJWK[];
    bbsBlsJwk?: IJWK;
    didCommJwk?: IJWK;
}

export interface VerificationMethod {
    id: string,
    type: string,
    publicKeyJwk: IJWK,
    purpose: Purpose[],
}

export interface IKeys {
    verificationMethods?: VerificationMethod[];
}