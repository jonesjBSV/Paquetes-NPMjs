import { IJWK } from "@extrimian/kms-core";
import { ModenaDocumentModel } from "@extrimian/modena-sdk";
export interface CreateDIDResponse {
    recoveryKeys: IJWK[];
    updateKeys: IJWK[];
    document: ModenaDocumentModel;
    longDid: string;
    didUniqueSuffix: string;
}
