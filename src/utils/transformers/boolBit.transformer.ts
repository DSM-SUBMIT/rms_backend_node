import { ValueTransformer } from 'typeorm';

export class BoolBitTransformer implements ValueTransformer {
  to(value: number | null): number | null {
    if (value === null) {
      return null;
    }
    return value;
  }
  from(value: Buffer): boolean | null {
    if (value === null) {
      return null;
    }
    return value[0] === 1;
  }
}
