import { AssertionMethodPurpose } from "@quarkid/did-core";
import { IES256kKeyPair, LANG, Suite } from "@quarkid/kms-core";
import { KMSClient } from "../src/services/kms-client";
import { BaseConverter, Base } from "@quarkid/kms-core";
import { VCVerifierService } from "@extrimian/vc-verifier";

const didDocument = require("./mock/did-document.json");
const vc = require("./mock/vc.json");
const bbsSignedVc = require("./mock/bbs-signed-vc.json")
const vcRsa = require("./mock/vc-rsa.json");
const rsaSignedVC = require("./mock/signed-vc.json");

jest.setTimeout(50000);

const contentToSign = "This is the content to sign";
let contentPacked: string;

describe("STORAGE", () => {
    it("Get All Keys", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        mapping.set(
            hexToJWKHex("0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44"), {
            curve: 'secp256k1',
            mnemonic: 'baile anemia término tabla tonto vivero remar gota útil morsa pájaro folio',
            privateKey: '0x4d1a563f607425d8b545f2c73f944c7fe4301204d46bf152dd5ef9a7003de27d',
            publicKey: '0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a',
            suite: Suite.ES256k
        });

        mapping.set(hexToJWKHex("d0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3"), {
            keyType: 'ed25519',
            privateKey: 'e96789382913cd4802bba5fff45d024ff63e43f06c372e0c95fd7b7d6e0d6a7ad0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            publicKey: 'd0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            suite: Suite.DIDComm
        });

        mapping.set(base58ToJWKHex(
            "qWb8CofFBmAxsRgvntXakizHkzyayVWcjQ8UdMQUUf3AJXLTtobjWdevUFiEibz9zDdmcGZg6H6Zr3YCpmvRzMyAuYfWi3uUZBvCi45ZzgfzJfr77SMV1r7aJZeSP9TDxqR"), {
            privateKey: '5iZsbqAVp6h1CYGATPmYjLFa6zFfX5dSR52jG1S592ap',
            publicKey: 'qWb8CofFBmAxsRgvntXakizHkzyayVWcjQ8UdMQUUf3AJXLTtobjWdevUFiEibz9zDdmcGZg6H6Zr3YCpmvRzMyAuYfWi3uUZBvCi45ZzgfzJfr77SMV1r7aJZeSP9TDxqR',
            suite: Suite.Bbsbls2020
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        let publicKeys = await kmsClient.getAllPublicKeys();

        expect(publicKeys).toHaveLength(3);
    });

    it("Export Key", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        //Remove ethr prefix 0x04 from public key
        mapping.set("0x121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a", {
            curve: 'secp256k1',
            mnemonic: 'baile anemia término tabla tonto vivero remar gota útil morsa pájaro folio',
            privateKey: '0x4d1a563f607425d8b545f2c73f944c7fe4301204d46bf152dd5ef9a7003de27d',
            publicKey: '0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a',
            suite: Suite.ES256k
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const publicKeyJWK = BaseConverter.convert("0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a",
            Base.Hex, Base.JWK);

        let secrets = await kmsClient.export(publicKeyJWK) as IES256kKeyPair;

        expect(secrets.curve).toEqual("secp256k1");
        expect(secrets.mnemonic).toEqual("baile anemia término tabla tonto vivero remar gota útil morsa pájaro folio");
        expect(secrets.privateKey).toEqual("0x4d1a563f607425d8b545f2c73f944c7fe4301204d46bf152dd5ef9a7003de27d");
        expect(secrets.publicKey).toEqual("0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a");
        expect(secrets.suite).toEqual(Suite.ES256k);
    });
});

describe('UNSUPPORTED SUITE', () => {
    it("Create unsupported suite", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        try {
            const secrets = await kmsClient.create("unsupportedSuite" as Suite);
        } catch (error: any) {
            expect(error).not.toBeNull();
            expect(error.message).toEqual("Unsupported Suite");
        }
    });
});


describe('ETHR SUITE', () => {
    it("ETHR Create Secrets and sign", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const secrets = await kmsClient.create(Suite.ES256k);

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.ES256k);

        expect(publicKeys).toHaveLength(1);
        expect(publicKeys[0]).not.toBeNull();
        expect(publicKeys[0]).toEqual(secrets.publicKeyJWK);

        const signedContent = await kmsClient.sign(Suite.ES256k, publicKeys[0], "Este es el contenido a firmar");
        console.log(signedContent);
    });

    it("ETHR Sign Content", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        mapping.set(
            hexToJWKHex("0x121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a"), {
            curve: 'secp256k1',
            mnemonic: 'baile anemia término tabla tonto vivero remar gota útil morsa pájaro folio',
            privateKey: '0x4d1a563f607425d8b545f2c73f944c7fe4301204d46bf152dd5ef9a7003de27d',
            publicKey: '0x04121ee5c82d3d343fc899a3d923347188938c94f22b15ef9cd05f1c423c65dac9634c1986dbe07f42ef3cd9bbd307bc574e6e26c7987f40c089028c884705c44a',
            suite: Suite.ES256k
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.ES256k);

        let signedContent = await kmsClient.sign(Suite.ES256k, publicKeys[0], contentToSign);

        expect(signedContent).not.toBeNull();
    });
});

describe("DIDComm v2 Suite", () => {
    it("Create Keys", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const secrets = await kmsClient.create(Suite.DIDCommV2);

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.DIDCommV2);

        expect(publicKeys).toHaveLength(1);
        expect(publicKeys[0]).not.toBeNull();
        expect(publicKeys[0]).toEqual(secrets.publicKeyJWK);
    });

    it("DIDComm 2 Pack & Unpack", async () => {
        let mappingSigner = new Map();

        let storage = {
            add: async (key, data) => { mappingSigner.set(key, data) },
            get: (key) => mappingSigner.get(key),
            getAll: async () => mappingSigner,
            remove: (key) => mappingSigner.delete(key),
            update: (key, data) => mappingSigner.set(key, data),
        };

        mappingSigner.set(hexToJWKHex("d0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3"), {
            keyType: 'Ed25519',
            privateKey: 'e96789382913cd4802bba5fff45d024ff63e43f06c372e0c95fd7b7d6e0d6a7ad0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            publicKey: 'd0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            suite: Suite.DIDComm
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.DIDComm);

        const contentPacked = await kmsClient.packv2(publicKeys[0],
            "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#didcomm", //Sender verification method
            ["8a983c05eaa75c9da139fb2f89e124acaef188db5c22ac9368ec3e8705634ce2"],
            {
                from: "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w",
                to: ["did:fake:example1"],
                id: "test",
                body: {},
                type: "protocol-identifier-uri/message-type-name",
            }, "authcrypt");

        expect(contentPacked).not.toBeNull();

        let mappingSigner2 = new Map();

        let storage2 = {
            add: async (key, data) => { mappingSigner2.set(key, data) },
            get: (key) => mappingSigner2.get(key),
            getAll: async () => mappingSigner2,
            remove: (key) => mappingSigner2.delete(key),
            update: (key, data) => mappingSigner2.set(key, data),
        };

        mappingSigner2.set(hexToJWKHex("8a983c05eaa75c9da139fb2f89e124acaef188db5c22ac9368ec3e8705634ce2"), {
            keyType: 'Ed25519',
            privateKey: '5cf687264f496205a122c51edd3497902a380690c7a6ab2331e271b32949cdf48a983c05eaa75c9da139fb2f89e124acaef188db5c22ac9368ec3e8705634ce2',
            publicKey: '8a983c05eaa75c9da139fb2f89e124acaef188db5c22ac9368ec3e8705634ce2',
            suite: Suite.DIDCommV2
        });

        let kmsClient2 = new KMSClient({
            lang: LANG.es, storage: storage2, didResolver: (did: string) => {
                return didDocument;
            }
        });

        let publicKeys2 = await kmsClient2.getPublicKeysBySuiteType(Suite.DIDCommV2);

        const value = await kmsClient2.unpackv2(publicKeys2[0], contentPacked);

        console.log(value);
    });
});

describe("DIDComm Suite", () => {
    it("Create Keys", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const secrets = await kmsClient.create(Suite.DIDComm);

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.DIDComm);

        expect(publicKeys).toHaveLength(1);
        expect(publicKeys[0]).not.toBeNull();
        expect(publicKeys[0]).toEqual(secrets.publicKeyJWK);

        const signedContent = await kmsClient.pack(publicKeys[0], ["d0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3"], "Este es el contenido a firmar");
        console.log(signedContent);
    });

    it("DIDComm PACK", async () => {
        let mappingSigner = new Map();

        let storage = {
            add: async (key, data) => { mappingSigner.set(key, data) },
            get: (key) => mappingSigner.get(key),
            getAll: async () => mappingSigner,
            remove: (key) => mappingSigner.delete(key),
            update: (key, data) => mappingSigner.set(key, data),
        };

        mappingSigner.set(hexToJWKHex("d0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3"), {
            keyType: 'ed25519',
            privateKey: 'e96789382913cd4802bba5fff45d024ff63e43f06c372e0c95fd7b7d6e0d6a7ad0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            publicKey: 'd0f3d5f8bce2d547d44a19de2a4786cd13d760ae0eaf2c06b2c1334e7e97adb3',
            suite: Suite.DIDComm
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.DIDComm);

        contentPacked = await kmsClient.pack(publicKeys[0],
            ["5ba46c41ec8d511954cdb0c787b5b710a6c744389dba77d12b3f20777418b4fc"], contentToSign);

        expect(contentPacked).not.toBeNull();
    });

    it("DIDComm Unpack", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        mapping.set(hexToJWKHex("5ba46c41ec8d511954cdb0c787b5b710a6c744389dba77d12b3f20777418b4fc"), {
            keyType: 'ed25519',
            privateKey: '9d4db891f8494d90f6c0783dce115158cac757c760c83203982b198bbe107f0a5ba46c41ec8d511954cdb0c787b5b710a6c744389dba77d12b3f20777418b4fc',
            publicKey: '5ba46c41ec8d511954cdb0c787b5b710a6c744389dba77d12b3f20777418b4fc',
            suite: Suite.DIDComm
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const keys = await kmsClient.getPublicKeysBySuiteType(Suite.DIDComm);

        const plainText = await kmsClient.unpack(keys[0], contentPacked);

        expect(plainText).toEqual(contentToSign)
    });
});


describe('BbsBls2020 SUITE', () => {
    it("BbsBls2020 Create Secrets", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const secrets = await kmsClient.create(Suite.Bbsbls2020);

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.Bbsbls2020);

        expect(publicKeys).toHaveLength(1);
        expect(publicKeys[0]).not.toBeNull();
        expect(publicKeys[0]).toEqual(secrets.publicKeyJWK);
    });
    it("BbsBls2020 Sign VC", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };


        mapping.set("0x881bd53b1cfe84de8c737e73d58223f4683efd8407ffb572af6e8505a2e372199e85e6bdb11a33be95c89761abf61222190a1c987f42dce08a062af6c48edcbf51d78168086d3b5e1cf2be0d35d214ae0a4a8584eca7d970b36d74b7f41ca20c", {
            privateKey: '7hCCyZGj7L4zTvf4W17H16v5u4U2mRwzJPKhwgSMfHyd',
            publicKey: 'otPct785rAkXEsU86Sk2Q8qDnivMCkWYRRRmoRJqoTuh4kzL1GhGZvvTVAi9ddTuuDKDxEPgazfdvy9HcykynzaoNWDeUFot8kZL7zbMtcYLMrXEE25R9ioVjbwGJADXHTR',
            suite: Suite.Bbsbls2020
        });

        let kmsClient = new KMSClient({
            lang: LANG.es, storage, didResolver: (did: string) => {
                console.log(didDocument);
                return didDocument;
            }
        });

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.Bbsbls2020);

        const signedVC = await kmsClient.signVC(Suite.Bbsbls2020, publicKeys[0], vc, "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#bbsbls",
            "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#bbsbls", new AssertionMethodPurpose());

        expect(signedVC).not.toBeNull();
        expect(signedVC.proof).not.toBeNull();
        expect(signedVC.proof.proofPurpose).toEqual("assertionMethod");
        expect(signedVC.proof.type).toEqual("BbsBlsSignature2020");
        expect(signedVC.proof.verificationMethod).toEqual("did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#bbsbls");
    });

    it("BBS Verify VC", async () => {
        const vcVerifier = new VCVerifierService({
            didDocumentResolver: async (did: string) => {
                console.log(didDocument);
                return didDocument;
            }
        });

        const verification = await vcVerifier.verify(bbsSignedVc, new AssertionMethodPurpose());

        expect(verification.result).toBe(true);
    });
});


describe('RSASignature2018 SUITE', () => {
    it("RSASignature2018 Create Secrets", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        const secrets = await kmsClient.create(Suite.RsaSignature2018);

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.RsaSignature2018);

        expect(publicKeys).toHaveLength(1);
        expect(publicKeys[0]).not.toBeNull();
        expect(publicKeys[0]).toEqual(secrets.publicKeyJWK);
    });
    it("RSASignature2018 Sign VC", async () => {
        let mapping = new Map();

        let storage = {
            add: async (key, data) => { mapping.set(key, data) },
            get: (key) => mapping.get(key),
            getAll: async () => mapping,
            remove: (key) => mapping.delete(key),
            update: (key, data) => mapping.set(key, data),
        };

        mapping.set("0xb372b68aa99c74cd18027bdd7166b76fce6689452b25c19201f193bc5b180f2d48a5e1e576258c40f0c5903ecb5081806d2b83b327fd080d571066386805d4719d3aa08d2ef1f1e98f59afe07c0fb144a38e2b0377258f7171abc00f8d8db8372f5e3d3f14cb899278e12bc1b58257261f0c5b2ecc7304d30605e2afbb62792b57c43b9722535a28fa873688cdd924ce4b71268eba53c065d34e27be1a1bb678bb6fc1a3e0b5b12dde380eec3e6c2e7011c1dc52215fbe35a3fec102391f8806555ff2a5dc181c64f5249cfbb2d3f325af638ab8af560889e8ab5a0f9a1a7be0e796981e94e50807010f8ca696469b9ff1f5cd1e7c3ab63c67245145298aace9", {
            privateKeyJWK:
            {
                kty: "RSA",
                n: "s3K2iqmcdM0YAnvdcWa3b85miUUrJcGSAfGTvFsYDy1IpeHldiWMQPDFkD7LUIGAbSuDsyf9CA1XEGY4aAXUcZ06oI0u8fHpj1mv4HwPsUSjjisDdyWPcXGrwA-Njbg3L149PxTLiZJ44SvBtYJXJh8MWy7McwTTBgXir7tieStXxDuXIlNaKPqHNojN2STOS3EmjrpTwGXTTie-Ghu2eLtvwaPgtbEt3jgO7D5sLnARwdxSIV--NaP-wQI5H4gGVV_ypdwYHGT1JJz7stPzJa9jirivVgiJ6KtaD5oae-DnlpgelOUIBwEPjKaWRpuf8fXNHnw6tjxnJFFFKYqs6Q",
                e: "AQAB",
                d: "k6OtzCgAMZkMR_7hEowQIE0Qz5-5ADdiiXbYtf-8q7_2JYTV5X6_Bi8SXLtNS89AepFyqdQcuqM_Hp77iZpCT7espKuEFEuUffysV2W7A34VksKQ91ZPzmZXiI1DSXZm8PH4Mg5J58Y67geyOEQkr5ib8elvDLLLbAkrmKnzOvyrrvLhFJdFo57E2zn0A8cohyWnVW1XCjxWssswh8GWmljcMEQPtKTAJTbMxlRIrhlqpnLNHTWWFf-8-AhWODMfptcXA_BOnR6g9Vtq61n2YqcbX8BVnnIPdScPOU6ClZaYbYVoFQONh_dDPUJ3pg5HQ5LvFT8lkVbBwRXs8-hgAQ",
                p: "7KA0JOOZb_WIZ2d6vNEFzuitdXIPBrFN3HdJfbKw9tzA7hBJYffVWsMQGwCuk8pIjHA6bddKzCL7vMidEhJ0mgqMtnElEucy_MRmsWHBzehbx-MSaEhOPlUQNjo5Oy2KqS_APQwvCscviMuIdAa6oUUIIF-hxof3-2g_ji6uM-E",
                q: "wiQJMXzmwuAq-zj0eFqkLkONO4rfDK5f-VmrfdhdsL1UV2nLOfPZJKT_mzUXJH8JK2CvePOfG_NBnZ9W9JuxUNJjuslEOd0DfTf32KRN_0X_mcyWrepKtqbyLKTFnt5l02ygefHxOrnLZWJwYUJu_CjuCsAnM9YqgJZuLDjmGgk",
                dp: "2XM3uBa4cJzQ50W_Ezl6_vPwQ5e3m0zg4pN0o-DMo2-mlJ--8BrSpH_Rkx8DT6l7FiQkbcCFaidT897gCTWQlebP_PDpQv_YaVULkkLl2RWJEp3n0pFv5fRB27OR2II3hNbu8Kr7qAn38twn34g3hfBsUWPQxSM6jnz0uvLG_8E",
                dq: "XINLljeMx4SHNtv3M3sODbXHEX6lt6dIuMwQOpHmY5h1Hoqde2pGKX4vB8kO1CdtOSyDscF2Kp2KwQ_zIfEnV_pJ5_KM_n3hccQ_6Q6y1FiI6sNhclLZc5yufrOuMHyOTWfQOQwgBfoPgKqeHtrHhIYEmT7j74G5EzmcGpqqm_E",
                qi: "E_M2ruvsR10UmIobVAOvS3LzFoTsHBsvID5VEI2P1Vh1isNjtLF6upD07G44HNoUxoyxq5XWrB418oStvSZHsv6xOSCoAkdAUDYYhOhXkN5cZRCBDof-ZPJgjXXyccgB963WdA8OkTI5LcEcxax6bBXsw3fIZRyDB8M15FgPGr4"

            },
            publicKeyJWK: {
                kty: "RSA",
                n: "s3K2iqmcdM0YAnvdcWa3b85miUUrJcGSAfGTvFsYDy1IpeHldiWMQPDFkD7LUIGAbSuDsyf9CA1XEGY4aAXUcZ06oI0u8fHpj1mv4HwPsUSjjisDdyWPcXGrwA-Njbg3L149PxTLiZJ44SvBtYJXJh8MWy7McwTTBgXir7tieStXxDuXIlNaKPqHNojN2STOS3EmjrpTwGXTTie-Ghu2eLtvwaPgtbEt3jgO7D5sLnARwdxSIV--NaP-wQI5H4gGVV_ypdwYHGT1JJz7stPzJa9jirivVgiJ6KtaD5oae-DnlpgelOUIBwEPjKaWRpuf8fXNHnw6tjxnJFFFKYqs6Q",
                e: "AQAB"
            },
            suite: Suite.RsaSignature2018
        });

        let kmsClient = new KMSClient({ lang: LANG.es, storage });

        let publicKeys = await kmsClient.getPublicKeysBySuiteType(Suite.RsaSignature2018);

        const signedVC = await kmsClient.signVCPresentation({
            publicKeyJWK: publicKeys[0],
            presentationObject: vcRsa,
            did: "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w",
            verificationMethodId: "did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#rsa",
            purpose: new AssertionMethodPurpose()
        });

        expect(signedVC).not.toBeNull();
        expect(signedVC.proof).not.toBeNull();
        expect(signedVC.proof.proofPurpose).toEqual("assertionMethod");
        expect(signedVC.proof.type).toEqual("RsaSignature2018");
        expect(signedVC.proof.verificationMethod).toEqual("did:modena:matic:EiDxVyreUxU_nBYhtifpAXC7PcgMJ3DLkl_1Vdxy0Izg0w#rsa");
    });
    it("RSASignature2018 Verify VC", async () => {
        const vcVerifier = new VCVerifierService({
            didDocumentResolver: async (did: string) => {
                console.log(didDocument);
                return didDocument;
            }
        });

        const result = await vcVerifier.verify(rsaSignedVC, new AssertionMethodPurpose());

        expect(result.result).toBe(true);
    });
});

const base58ToJWKHex = (pk) => {
    return BaseConverter.convert(BaseConverter.convert(pk, Base.Base58, Base.JWK), Base.JWK, Base.Hex);
}

const hexToJWKHex = (pk) => {
    return BaseConverter.convert(BaseConverter.convert(pk, Base.Hex, Base.JWK), Base.JWK, Base.Hex);;
}