import { IKeyPair } from "../keypair";
import { Purpose } from "@quarkid/did-core";
import { IVCJsonLDKeyPair, IVCSuite } from "./vc.suite";

export interface IBbsBls2020Suite extends IVCSuite {
    create: () => Promise<IVCJsonLDKeyPair>;
    sign: (documentToSign: string, did: string, verificationMethodId: string, porpuse: Purpose) => Promise<any>;
}