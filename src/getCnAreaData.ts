import { decode } from './decode';
import { CnAreaData } from './types';

let cnAreaData: CnAreaData;
export function getCnAreaData() {
  if (!cnAreaData) {
    cnAreaData = decodeAreaData();
  }

  return cnAreaData;
}

function decodeAreaData() {
  return decode(PKG_ENV.encodeText);
}
