import { DIDDocument, Purpose } from "@quarkid/did-core";
import { verifiers } from "../decorators/inject-verifier-decorator";
import { VerifiableCredential } from "@quarkid/vc-core";
import axios, { AxiosError, AxiosResponse } from "axios";
import { CredentialStatusType } from "@quarkid/vc-core";
import {
  CredentialStatusServiceError,
  DIDDocumentResolutionError,
  InvalidSignatureError,
  UnexpectedChallengeError,
  UnhandledVCSuiteError,
  VCSuiteError,
  VCUnexpectedError,
  VerifiableCredentialExpired,
  VerifiableCredentialRevoked,
  VerifiableCredentialSuspended,
  VerificationRelationshipError,
} from "../errors/error-code";

export class VCVerifierService {
  constructor(
    private params: {
      didDocumentResolver: (did: string) => Promise<DIDDocument>;
    }
  ) {}

  async verify(
    vc: VerifiableCredential | string,
    purpose: Purpose
  ): Promise<{ result: boolean; error?: VCSuiteError }> {
    if (typeof vc === "string") {
      vc = JSON.parse(vc);
    }

    const vcObj = vc as VerifiableCredential;

    if (
      vcObj.credentialStatus &&
      vcObj.credentialStatus.type ==
        CredentialStatusType.CredentialStatusList2017
    ) {
      const errors = new Array<{ status: string; message: string }>();

      try {
        let response: AxiosResponse<any, any>;
        try {
          response = await axios.post(vcObj.credentialStatus.id, null);
        } catch (ex: unknown) {
          if (ex instanceof AxiosError) {
            if (ex.isAxiosError) {
              return {
                result: false,
                error: new CredentialStatusServiceError(
                  vcObj.credentialStatus.id,
                  ex.response.status,
                  ex.response.data
                ),
              };
            }
          }
          throw new VCUnexpectedError(ex);
        }

        if (response.data?.verifiableCredential) {
          for (let i = 0; i < response.data?.verifiableCredential.length; i++) {
            if (
              response.data?.verifiableCredential[
                i
              ].claim.currentStatus.toLowerCase() == "revoked" ||
              response.data?.verifiableCredential[
                i
              ].claim.currentStatus.toLowerCase() == "suspend"
            ) {
              errors.push({
                status:
                  response.data?.verifiableCredential[i].claim.currentStatus,
                message:
                  response.data?.verifiableCredential[i].claim.statusReason,
              });
            }
          }
          if (errors.length > 0) {
            return {
              result: false,
              error: errors.some((x) => x.status.toLowerCase() == "revoked")
                ? new VerifiableCredentialRevoked(
                    errors.map((x) => `${x.status} - ${x.message}`)
                  )
                : new VerifiableCredentialSuspended(
                    errors.map((x) => `${x.status} - ${x.message}`)
                  ),
            };
          }
        }
      } catch (ex) {
        throw new VCUnexpectedError(ex);
      }
    }
    // check expiration date
    if (vcObj.expirationDate && new Date(vcObj.expirationDate) < new Date()) {
      
      throw new VerifiableCredentialExpired();
    }

    const verifierInstance = verifiers.get(vcObj.proof.type);

    const verifier = new verifierInstance();

    try {
      const result = await verifier.verify(
        vcObj,
        purpose,
        this.params.didDocumentResolver
      );
      if (
        result.errors?.find(
          (x) =>
            x
              .toLowerCase()
              .indexOf("no proofs matched the required suite and purpose") > -1
        )
      ) {
        return {
          result: false,
          error: new VerificationRelationshipError(
            vcObj.proof.verificationMethod,
            purpose.name
          ),
        };
      
      } else if (
        result.errors?.find(
          (x) =>
            x
              .toLowerCase()
              .indexOf("the challenge is not as expected") > -1
        )
      ) {
        return {
          result: false,
          error: new UnexpectedChallengeError(
            result.errors[0]
          ),
        };
      } else if (
        result.errors?.find(
          (x) => x.toLowerCase().indexOf("invalid signature") > -1
        )
      ) {
        return {
          result: false,
          error: new InvalidSignatureError(),
        };
      } else if (
        result.errors?.find(
          (x) => x.toLowerCase().indexOf("did document can't be resolved") > -1
        )
      ) {
        return {
          result: false,
          error: new DIDDocumentResolutionError(
            vcObj.proof.verificationMethod.substring(
              0,
              vcObj.proof.verificationMethod.indexOf("#")
            )
          ),
        };
      } else if (
        result.errors?.length > 0
      ){
        return {
        result: false,
        error: new UnhandledVCSuiteError(result.errors[0])
      }
    }
     return result
    } catch (ex) {
      if (ex.name) {
        return {
          result: false,
          error: ex,
        };
      } else throw new VCUnexpectedError(ex);
    }
  }
}
