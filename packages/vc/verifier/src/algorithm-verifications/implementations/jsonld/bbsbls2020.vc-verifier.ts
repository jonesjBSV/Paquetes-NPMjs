import { VerificationMethod, VerificationMethodJwk, VerificationMethodPublicKey58 } from "@quarkid/did-core";
import { JsonLDVCVerifier } from "./jsonld.vc-verifier";
import { BbsBlsSignature2020, Bls12381G2KeyPair } from "@mattrglobal/jsonld-signatures-bbs"
import { Base, BaseConverter } from "@quarkid/kms-core";
import { InjectVerifier } from "../../../decorators/inject-verifier-decorator";

///Bbs2020VCVerifier Algorithm to verify Verifiable Credential. Use once instance for verification
@InjectVerifier("BbsBlsSignature2020")
export class BbsBls2020VCVerifier extends JsonLDVCVerifier {
    async getSuite() {
        return new BbsBlsSignature2020();
    }

    vmConvertions(vm: VerificationMethod): VerificationMethodPublicKey58 {
        if (vm.type == "Bls12381G1Key2020" && (<VerificationMethodJwk>vm).publicKeyJwk) {
            return {
                id: vm.id,
                controller: vm.controller,
                publicKeyBase58: BaseConverter.convert((<VerificationMethodJwk>vm).publicKeyJwk,
                    Base.JWK, Base.Base58),
            } as VerificationMethodPublicKey58;
        }
    }
}