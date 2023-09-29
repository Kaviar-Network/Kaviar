import { BigNumber } from "@ethersproject/bignumber";
import { isHexString, hexlify } from "@ethersproject/bytes";
import { Logger } from "@ethersproject/logger";
import { Poseidon } from "circomlibjs";

function hexZeroPad(value: string, length: number) {
  if (typeof value !== "string") {
    value = hexlify(value);
  } else if (!isHexString(value)) {
    new Logger("5.0.0-beta.125").throwArgumentError(
      "invalid hex string",
      "value",
      value
    );
  }

  if (value.length > 2 * length + 2) {
    new Logger("5.0.0-beta.125").throwArgumentError(
      "value out of range",
      "value",
      arguments[1]
    );
  }

  while (value.length < 2 * length + 2) {
    value = "0x0" + value.substring(2);
  }

  return value;
}

export function poseidonHash(poseidon: any, inputs: any) {
  const hash = poseidon(inputs.map((x: any) => BigNumber.from(x).toBigInt()));
  // Make the number within the field size
  const hashStr = poseidon.F.toString(hash);
  // Make it a valid hex string
  const hashHex = BigNumber.from(hashStr).toHexString();
  // pad zero to make it 32 bytes, so that the output can be taken as a bytes32 contract argument
  const bytes32 = hexZeroPad(hashHex, 32);
  return bytes32;
}

export class PoseidonHasher {
  poseidon: Poseidon;

  constructor(poseidon: any) {
    this.poseidon = poseidon;
  }

  hash(left: any, right: any) {
    return poseidonHash(this.poseidon, [left, right]);
  }
}
