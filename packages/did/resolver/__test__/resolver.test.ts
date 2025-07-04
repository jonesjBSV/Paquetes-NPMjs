import { IJWK, LANG, Suite } from "@quarkid/kms-core";
import { KMSClient } from "@quarkid/kms-client";
import { Did } from "../../registry/src/index";
import { AssertionMethodPurpose, DIDDocument } from "@quarkid/did-core";
import { DIDUniversalResolver } from "../src/services/universal-resolver";

jest.setTimeout(5000000);

let _kms: KMSClient | null = null;
let did: string;
let recoveryKey: IJWK;
let modenaEndpoint = "http://localhost:3000";
let universalResolverEndpoint = "http://localhost:8010";

const getKMS = async (): Promise<KMSClient> => {
  if (!_kms) {
    let mapping = new Map();

    let storage = {
      add: async (key: string, data: any) => { mapping.set(key, data) },
      get: (key: string) => mapping.get(key),
      getAll: async () => mapping,
      remove: (key: string) => mapping.delete(key),
      update: (key: string, data: any) => mapping.set(key, data),
    };

    _kms = new KMSClient({
      lang: LANG.es,
      storage: storage,
    });
  }
  return _kms;
}

const getDidDocument = (did: string) => new Promise<DIDDocument>((resolve, reject) => {
  setTimeout(async () => {
    const universalResolver = new DIDUniversalResolver({ universalResolverURL: universalResolverEndpoint });
    resolve(await universalResolver.resolveDID(did));
  }, 60000);
});

describe("CREATE DID & RESOLVE ", () => {
  it("Create and public DID", async () => {
    let kms = await getKMS();

    const publicKey1 = await kms.create(Suite.ES256k);
    const secret1 = await kms.export(publicKey1.publicKeyJWK);
    console.log(secret1);

    const publicKey2 = await kms.create(Suite.ES256k);
    const secret2 = await kms.export(publicKey2.publicKeyJWK);
    console.log(secret2);

    //CREATE BBS PUBLIC KEYS
    const bbs = await kms.create(Suite.Bbsbls2020);
    const secretBbs = await kms.export(bbs.publicKeyJWK);
    console.log(secretBbs);

    const registry = new Did()

    const createDIDResponse = await registry.createDID({
      recoveryKeys: [publicKey1.publicKeyJWK, publicKey2.publicKeyJWK],
      updateKeys: [publicKey1.publicKeyJWK, publicKey2.publicKeyJWK],
      verificationMethods: [{
        id: "bbsbls",
        publicKeyJwk: bbs.publicKeyJWK,
        purpose: [new AssertionMethodPurpose()],
        type: "Bls12381G1Key2020",
      }]
    });

    const result = await registry.publishDID({ createDIDResponse: createDIDResponse, modenaApiURL: modenaEndpoint })

    const didDocument = await getDidDocument(result.did);
    expect(didDocument.id).toEqual(result.did);
    console.log(didDocument);
  });
});