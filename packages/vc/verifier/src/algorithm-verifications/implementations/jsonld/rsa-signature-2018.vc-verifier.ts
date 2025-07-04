import { DIDDocument, Purpose, VerificationMethod, VerificationMethodJwk, VerificationMethodPublicKeyPem } from "@quarkid/did-core";
import { JsonLDVCVerifier } from "./jsonld.vc-verifier";
import { InjectVerifier } from "../../../decorators/inject-verifier-decorator";
import { VerifiableCredential } from "@quarkid/vc-core";
const jsigs = require('jsonld-signatures');
var jwkToPem = require('jwk-to-pem');
const { RSAKeyPair } = require('crypto-ld');
const { RsaSignature2018 } = jsigs.suites;

///Bbs2020VCVerifier Algorithm to verify Verifiable Credential. Use once instance for verification
@InjectVerifier("RsaSignature2018")
export class RsaSignature2018Verifier extends JsonLDVCVerifier {
    async getSuite(params?: {
        vc: VerifiableCredential,
        purpose: Purpose,
        didDocumentResolver: (did: string) => Promise<DIDDocument>
    }) {
        const vm = await this.getVerificationMethod<VerificationMethodJwk>(params.vc.proof.verificationMethod);

        const publicKeyPem = jwkToPem(vm.publicKeyJwk);

        const publicKey = {
            '@context': jsigs.SECURITY_CONTEXT_URL,
            type: 'RsaVerificationKey2018',
            id: params.vc.proof.verificationMethod,
            controller: params.vc.proof.verificationMethod.substring(0, params.vc.proof.verificationMethod.indexOf("#")),
            publicKeyPem
        };

        const key = new RSAKeyPair({ ...publicKey });
        return new RsaSignature2018({
            key
        });
    }

    vmConvertions(vm: VerificationMethod): VerificationMethodPublicKeyPem {
        if ((<VerificationMethodJwk>vm).publicKeyJwk) {
            const b = {
                id: vm.id,
                controller: vm.controller,
                publicKeyPem: jwkToPem((<VerificationMethodJwk>vm).publicKeyJwk),
            } as VerificationMethodPublicKeyPem;

            return b;
        }
    }
}