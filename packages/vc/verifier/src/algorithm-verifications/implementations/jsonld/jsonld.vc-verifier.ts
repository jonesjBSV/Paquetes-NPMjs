import { VCVerifier } from "../../vc-verifier";
import { AuthenticationPurpose, DIDDocument, Purpose, VerificationMethod } from "@quarkid/did-core";
import { VerifiableCredential } from "@quarkid/vc-core";
import { isArray } from "util";
import { AuthenticationPurposeChallengeRequired, VerificationMethodNotFound } from "../../../errors/error-code";
const jsonld = require("jsonld-signatures");
const axios = require("axios");

///JSONLD Algorithm to verify Verifiable Credential. Use once instance for verification
export abstract class JsonLDVCVerifier implements VCVerifier {
    private cache = new Map<string, any>();
    private didDocumentResolver: (did: string) => Promise<DIDDocument>;

    contextDictionary =
        [
            { key: "https://www.w3.org/2018/credentials/v1", value: "https://extrimian.blob.core.windows.net/rskec/credentialsv1.jsonld" },
            { key: "https://w3id.org/security/bbs/v1", value: "https://extrimian.blob.core.windows.net/rskec/securitybbsv1.jsonld" },
        ];

    constructor(private params: {
        useCache: boolean,
    }) {
        params = params || { useCache: true };
        if (params.useCache == null)
            params.useCache = true;

        this.params = params;
    }

    abstract getSuite(params?: {
        vc: VerifiableCredential,
        purpose: Purpose,
        didDocumentResolver: (did: string) => Promise<DIDDocument>
    }): Promise<any>;

    vmConvertions(vm: VerificationMethod): VerificationMethod { return vm; }

    customDocLoader = async (url: string): Promise<any> => {
        if (url.indexOf('did:') > -1 && url.indexOf("#") > -1) {

            const vm = await this.getVerificationMethod(url);

            if (vm) {
                return {
                    contextUrl: null, // this is for a context via a link header
                    document: this.vmConvertions(vm), // this is the actual document that was loaded
                    documentUrl: url // this is the actual context URL after redirects
                };
            }
        } else if (url.indexOf("did:") > -1) {
            const didDocument = await this.cacheGetter(url, async () => await this.didDocumentResolver(url));

            return {
                contextUrl: null, // this is for a context via a link header
                document: didDocument, // this is the actual document that was loaded
                documentUrl: url // this is the actual context URL after redirects
            };
        } else {
            const response = await this.cacheGetter(url, async () => {
                let contextURL = this.contextDictionary.find(x => url.includes(x.key))?.value || url;
                const response = await axios.get(contextURL);
                return response.data;
            });

            return {
                contextUrl: null,
                document: response,
                documentUrl: url
            };
        }
    };


    protected async getVerificationMethod<TVerificationMethod extends VerificationMethod = VerificationMethod>
        (vmId: string): Promise<TVerificationMethod> {
        const did = vmId.substring(0, vmId.indexOf("#"));

        const didDocument = await this.cacheGetter(did, async () => await this.didDocumentResolver(did));

        if (!didDocument || !didDocument?.id) throw new Error("DID Document can't be resolved");

        const vm = didDocument.verificationMethod.find(
            (x: any) => x.id.substring(x.id.lastIndexOf("#")) == vmId.substring(vmId.lastIndexOf("#")));

        if (vm) return vm;

        for (const field in didDocument) {
            if (isArray(didDocument[field])) {
                for (const vm in didDocument[field]) {
                    if (didDocument[field][vm].id == vmId) {
                        return didDocument[field][vm];
                    }
                }
            }
        }

        throw new VerificationMethodNotFound(vmId, did);
    }

    documentLoader: any = jsonld.extendContextLoader(this.customDocLoader);

    async verify(vc: VerifiableCredential, purpose: Purpose, didDocumentResolver: (did: string) => Promise<DIDDocument>): Promise<{ result: boolean, errors?: string[] }> {
        this.didDocumentResolver = didDocumentResolver;

        const suite = await this.getSuite({ vc, purpose, didDocumentResolver });

        let verifyProof = await jsonld.verify(vc, {
            suite: suite,
            purpose: this.getPurpose(purpose),
            documentLoader: this.documentLoader
        });

        return {
            result: verifyProof.verified,
            errors: verifyProof.error?.errors?.map(x => x.message),
        }
    }

    private async cacheGetter(key: string, action: (key: string) => Promise<any>) {
        if (!this.params.useCache || !this.cache.has(key)) {
            const value = await action(key);
            this.cache.set(key, value);
        }

        return this.cache.get(key);
    }

    private getPurpose(purpose: Purpose) {
        if (purpose.name == "authentication") {
            if ((<AuthenticationPurpose>purpose).challenge) {
                return new jsonld.purposes.AuthenticationProofPurpose({
                    challenge: (<AuthenticationPurpose>purpose).challenge
                });
            }

            throw new AuthenticationPurposeChallengeRequired();

        }
        return new jsonld.purposes.ControllerProofPurpose({ term: purpose.name });
    }
}