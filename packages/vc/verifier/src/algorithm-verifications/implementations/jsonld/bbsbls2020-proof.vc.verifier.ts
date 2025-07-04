import { VerificationMethod, VerificationMethodJwk, VerificationMethodPublicKey58 } from "@quarkid/did-core";
import { JsonLDVCVerifier } from "./jsonld.vc-verifier";
import { BbsBlsSignatureProof2020 } from "@mattrglobal/jsonld-signatures-bbs"
import { Base, BaseConverter } from "@quarkid/kms-core";
import { InjectVerifier } from "../../../decorators/inject-verifier-decorator";

///Bbs2020VCVerifier Algorithm to verify Verifiable Credential. Use once instance for verification
@InjectVerifier("BbsBlsSignatureProof2020")
export class BbsBlsSignatureProof2020VCVerifier extends JsonLDVCVerifier {
    async getSuite() {
        return new BbsBlsSignatureProof2020();
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