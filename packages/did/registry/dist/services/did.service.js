"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Did = exports.ModenaDidPublishRequest = void 0;
var node_fetch_1 = require("node-fetch");
var modena_registry_service_1 = require("./modena-registry.service");
var publish_did_request_1 = require("../models/publish-did-request");
var modena_sdk_1 = require("@extrimian/modena-sdk");
var ModenaDidPublishRequest = /** @class */ (function (_super) {
    __extends(ModenaDidPublishRequest, _super);
    function ModenaDidPublishRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ModenaDidPublishRequest;
}(publish_did_request_1.PublishDIDRequest));
exports.ModenaDidPublishRequest = ModenaDidPublishRequest;
var Did = /** @class */ (function (_super) {
    __extends(Did, _super);
    function Did() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Did.prototype.publishDID = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var input, createRequest, url, headers, options, response, msg, canonicalId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        input = {
                            recoveryKeys: request.createDIDResponse.recoveryKeys,
                            updateKeys: request.createDIDResponse.updateKeys,
                            document: request.createDIDResponse.document
                        };
                        createRequest = modena_sdk_1.ModenaRequest.createCreateRequest(input);
                        url = "".concat(request.modenaApiURL, "/create");
                        headers = {
                            "Content-Type": "application/json",
                        };
                        if (request.apiKey && (request.apiKey.type == "queryParam" || !request.apiKey.type)) {
                            url = "".concat(url, "?").concat(request.apiKey.fieldName || "apikey", "=").concat(request.apiKey.value);
                        }
                        else if (request.apiKey) {
                            headers[request.apiKey.fieldName || "apikey"] = request.apiKey.value;
                        }
                        ;
                        options = {
                            method: "POST",
                            headers: headers,
                            body: JSON.stringify(createRequest),
                        };
                        return [4 /*yield*/, (0, node_fetch_1.default)(url, options)];
                    case 1:
                        response = _a.sent();
                        if (!(response.status !== 200 && response.status !== 201)) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        msg = _a.sent();
                        throw new Error("DID creation is not ok: ".concat(msg));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        canonicalId = (_a.sent())
                            .didDocumentMetadata.canonicalId;
                        return [2 /*return*/, {
                                canonicalId: canonicalId.substring(canonicalId.lastIndexOf(":") + 1),
                                did: canonicalId,
                                longDid: canonicalId.substring(0, canonicalId.lastIndexOf(":")) + request.createDIDResponse.longDid.replace("did:", ":"),
                            }];
                }
            });
        });
    };
    Did.prototype.updateDID = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var request, url, headers, options, response, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, modena_sdk_1.ModenaRequest.createUpdateRequest({
                            nextUpdatePublicKeys: params.newUpdateKeys,
                            documentMetadata: params.documentMetadata,
                            updateKeysToRemove: params.updateKeysToRemove,
                            didSuffix: params.didSuffix,
                            updatePublicKey: params.updatePublicKey,
                            signer: {
                                sign: function (header, content) {
                                    return __awaiter(this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, params.signer(content)];
                                                case 1: return [2 /*return*/, _a.sent()];
                                            }
                                        });
                                    });
                                }
                            },
                            idsOfPublicKeysToRemove: params.idsOfVerificationMethodsToRemove,
                            idsOfServicesToRemove: params.idsOfServiceToRemove,
                            publicKeysToAdd: params.verificationMethodsToAdd.map(function (x) { return ({
                                id: x.id,
                                publicKeyJwk: x.publicKeyJwk,
                                type: x.type,
                                purposes: x.purpose.map(function (y) { return y.name; })
                            }); }),
                            servicesToAdd: params.servicesToAdd
                        })];
                    case 1:
                        request = _a.sent();
                        url = "".concat(params.updateApiUrl, "/create");
                        headers = {
                            "Content-Type": "application/json",
                        };
                        if (params.apiKey && (params.apiKey.type == "queryParam" || !params.apiKey.type)) {
                            url = "".concat(url, "?").concat(params.apiKey.fieldName || "apikey", "=").concat(params.apiKey.value);
                        }
                        else if (params.apiKey) {
                            headers[params.apiKey.fieldName || "apikey"] = params.apiKey.value;
                        }
                        ;
                        options = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(request),
                        };
                        return [4 /*yield*/, (0, node_fetch_1.default)(url, options)];
                    case 2:
                        response = _a.sent();
                        if (!(response.status !== 200 && response.status !== 201)) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        msg = _a.sent();
                        throw new Error("DID update is not ok: ".concat(msg));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Did;
}(modena_registry_service_1.ModenaRegistryBase));
exports.Did = Did;
//# sourceMappingURL=did.service.js.map