"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModenaRegistryBase = void 0;
var modena_sdk_1 = require("@extrimian/modena-sdk");
var kms_client_1 = require("@quarkid/kms-client");
var kms_core_1 = require("@quarkid/kms-core");
var node_fetch_1 = require("node-fetch");
var ModenaRegistryBase = /** @class */ (function () {
    function ModenaRegistryBase() {
    }
    ModenaRegistryBase.prototype.create = function (createApiUrl, initialPublicKeys, storage, services, mobile) {
        return __awaiter(this, void 0, void 0, function () {
            var recoveryKey, updateKey, didCommJwk, bbsBlsJwk, kmsClient, publicKeyJWK, publicKeyJWK, publicKeyJWK, publicKeyJWK, publicKeyDidComm, publicKeyBbs, publicKeys, document, input, request, options, response, msg, canonicalId, exportedRecoveryKey, _a, _b, exportedUpdateKey, _c, _d, exportedDidCommKey, exportedBbsKey;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        recoveryKey = initialPublicKeys.recoveryKey;
                        updateKey = initialPublicKeys.updateKey;
                        didCommJwk = initialPublicKeys.didCommJwk;
                        bbsBlsJwk = initialPublicKeys.bbsBlsJwk;
                        kmsClient = new kms_client_1.KMSClient({
                            lang: kms_core_1.LANG.en,
                            storage: storage,
                            mobile: mobile
                        });
                        if (!!recoveryKey) return [3 /*break*/, 2];
                        return [4 /*yield*/, kmsClient.create(kms_core_1.Suite.ES256k)];
                    case 1:
                        publicKeyJWK = (_e.sent()).publicKeyJWK;
                        recoveryKey = [publicKeyJWK];
                        _e.label = 2;
                    case 2:
                        if (!!updateKey) return [3 /*break*/, 4];
                        return [4 /*yield*/, kmsClient.create(kms_core_1.Suite.ES256k)];
                    case 3:
                        publicKeyJWK = (_e.sent()).publicKeyJWK;
                        updateKey = [publicKeyJWK];
                        _e.label = 4;
                    case 4:
                        if (!!didCommJwk) return [3 /*break*/, 6];
                        return [4 /*yield*/, kmsClient.create(kms_core_1.Suite.DIDCommV2)];
                    case 5:
                        publicKeyJWK = (_e.sent()).publicKeyJWK;
                        didCommJwk = publicKeyJWK;
                        _e.label = 6;
                    case 6:
                        if (!!bbsBlsJwk) return [3 /*break*/, 8];
                        return [4 /*yield*/, kmsClient.create(kms_core_1.Suite.Bbsbls2020)];
                    case 7:
                        publicKeyJWK = (_e.sent()).publicKeyJWK;
                        bbsBlsJwk = publicKeyJWK;
                        _e.label = 8;
                    case 8:
                        publicKeyDidComm = {
                            id: "did-comm",
                            type: "X25519KeyAgreementKey2019",
                            publicKeyJwk: didCommJwk,
                            purposes: [modena_sdk_1.ModenaPublicKeyPurpose.KeyAgreement],
                        };
                        publicKeyBbs = {
                            id: "vc-bbs",
                            type: "Bls12381G1Key2020",
                            publicKeyJwk: bbsBlsJwk,
                            purposes: [modena_sdk_1.ModenaPublicKeyPurpose.AssertionMethod],
                        };
                        publicKeys = [publicKeyDidComm, publicKeyBbs];
                        document = {
                            publicKeys: publicKeys,
                            services: services,
                        };
                        input = { recoveryKeys: recoveryKey, updateKeys: updateKey, document: document };
                        request = modena_sdk_1.ModenaRequest.createCreateRequest(input);
                        options = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(request),
                        };
                        return [4 /*yield*/, (0, node_fetch_1.default)(createApiUrl, options)];
                    case 9:
                        response = _e.sent();
                        if (!(response.status !== 200 && response.status !== 201)) return [3 /*break*/, 11];
                        return [4 /*yield*/, response.json()];
                    case 10:
                        msg = _e.sent();
                        throw new Error("DID creation is not ok: ".concat(msg));
                    case 11: return [4 /*yield*/, response.json()];
                    case 12:
                        canonicalId = (_e.sent())
                            .didDocumentMetadata.canonicalId;
                        _b = (_a = Promise).all;
                        return [4 /*yield*/, recoveryKey.map(function (x) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, kmsClient.export(x)];
                            }); }); })];
                    case 13: return [4 /*yield*/, _b.apply(_a, [_e.sent()])];
                    case 14:
                        exportedRecoveryKey = _e.sent();
                        _d = (_c = Promise).all;
                        return [4 /*yield*/, updateKey.map(function (x) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, kmsClient.export(x)];
                            }); }); })];
                    case 15: return [4 /*yield*/, _d.apply(_c, [_e.sent()])];
                    case 16:
                        exportedUpdateKey = _e.sent();
                        return [4 /*yield*/, kmsClient.export(didCommJwk)];
                    case 17:
                        exportedDidCommKey = _e.sent();
                        return [4 /*yield*/, kmsClient.export(bbsBlsJwk)];
                    case 18:
                        exportedBbsKey = _e.sent();
                        return [2 /*return*/, {
                                canonicalId: canonicalId,
                                recoveryKey: exportedRecoveryKey,
                                updateKey: exportedUpdateKey,
                                didCommKey: exportedDidCommKey,
                                bbsBls2020Key: exportedBbsKey,
                            }];
                }
            });
        });
    };
    ModenaRegistryBase.prototype.createDID = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var updateKeys, recoveryKeys, publicKeys, document, longDid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (modena_sdk_1.ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes < 2000) {
                            modena_sdk_1.ModenaSdkConfig.maxCanonicalizedDeltaSizeInBytes = 2000;
                        }
                        updateKeys = params.updateKeys;
                        recoveryKeys = params.recoveryKeys;
                        publicKeys = params.verificationMethods.map(function (vm) {
                            return {
                                id: vm.id,
                                publicKeyJwk: vm.publicKeyJwk,
                                type: vm.type,
                                purposes: vm.purpose.map(function (x) { return x.name; }),
                            };
                        });
                        document = {
                            publicKeys: publicKeys,
                            services: params.services,
                        };
                        modena_sdk_1.ModenaSdkConfig.network = params.didMethod;
                        return [4 /*yield*/, modena_sdk_1.ModenaDid.createLongFormDid({ recoveryKeys: recoveryKeys, updateKeys: updateKeys, document: document })];
                    case 1:
                        longDid = _a.sent();
                        return [2 /*return*/, {
                                recoveryKeys: recoveryKeys,
                                updateKeys: updateKeys,
                                document: document,
                                longDid: longDid,
                                didUniqueSuffix: longDid.substring(longDid.substring(0, longDid.lastIndexOf(":")).lastIndexOf(":") + 1)
                            }];
                }
            });
        });
    };
    ModenaRegistryBase.prototype.publish = function (did) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, did];
            });
        });
    };
    return ModenaRegistryBase;
}());
exports.ModenaRegistryBase = ModenaRegistryBase;
//# sourceMappingURL=modena-registry.service.js.map