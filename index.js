import sha1 from 'sha1';
import Hashids from 'hashids';
import QRCode from 'qrcode';

const deviceGuid = '625579bdad1e434c';
const deviceSalt = 'c3e8a84e2b13cc11';

const saltStr = `${deviceSalt}+qrmenu.domain`;

const timeResolution = 60;
const nowDate = new Date();
const nowUtc = Date.UTC(
  nowDate.getUTCFullYear(),
  nowDate.getUTCMonth(),
  nowDate.getUTCDate(),
  nowDate.getUTCHours(),
  nowDate.getUTCMinutes(),
  nowDate.getUTCSeconds()
);
const date = new Date(nowUtc);
const dayStartStamp = Date.UTC(
  nowDate.getUTCFullYear(),
  nowDate.getUTCMonth(),
  nowDate.getUTCDate(),
  0,
  0,
  0
);
const dayStart = new Date(dayStartStamp);
const dayIndex = Math.floor(dayStart.getTime() / 1000) / 86400;
const daySeconds =
  date.getSeconds() + 60 * (date.getMinutes() + 60 * date.getHours());
const daySliceIndex = Math.floor(daySeconds / timeResolution);

const createKey = (deviceGuid) => {
  const hash = sha1(
    `${saltStr}+${daySliceIndex}+${dayIndex}+${deviceGuid}+${saltStr}`
  );
  var key = '';
  for (var i = 0; i < 32; i += 4) key += hash.substring(i, i + 1);
  return key;
};

const deviceStr = deviceGuid.replaceAll('-', '');
const keyStr = createKey(deviceStr);
const timeStampStr = Math.floor(date.getTime() / 1000).toString(16);

const hashParts = [
  keyStr.substring(0, 8),
  deviceStr.substring(0, 8),
  deviceStr.substring(8, 16),
].map((hashPart) => parseInt(hashPart, 16));

const hashids = new Hashids(saltStr);
const hash = hashids.encode(hashParts);
const parseHash = (hash) => {
  var hashPartsInt = null;
  try {
    hashPartsInt = hashids.decode(hash);
  } catch (exception) {
    console.log(exception);
    return null;
  }
  if (hashPartsInt == null || hashPartsInt.length != 3) return null;
  const hashParts = hashPartsInt.map((hashPart) => {
    const hashPartStr = hashPart.toString(16);
    return hashPartStr.length == 7 ? `0${hashPartStr}` : hashPartStr;
  });
  const deviceGuid = hashParts.slice(1, 3).join('').trim();
  const keyStr = hashParts.slice(0, 1).join('').trim();
  const nowKeyStr = createKey(deviceGuid).trim();
  if (nowKeyStr != keyStr) return null;
  return deviceGuid;
};

const link = 'https://qrmenu.domain/t/'.toLowerCase();
const qrUrl = `${link}${hash}`;

const requestDeviceGuid = parseHash('Yp9ZNDzu9GgVyvsjoz7q7');
console.log(requestDeviceGuid);
console.log(deviceStr);
console.log(keyStr);
console.log(hash);
console.log(qrUrl);

// QRCode.toFile('qr.png', [{ data: qrUrl }], { errorCorrectionLevel: 'L' })
//   .then(async (_) => {
//     console.log();
//   })
//   .catch((error) => {
//     console.error(error);
//   });
