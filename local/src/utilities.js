/**
 * Author: JIN XIAO & DAVE COCHRAN
 * Email: xiaojin971212@gmail.com
 * Email: dcochra2@inf.ed.ac.uk
 */

import { SHA3, MD5 } from "crypto-js";
//import Forge from "node-Forge";
var Forge = require("node-forge");
/**
 *
 * Coping string to the clipboard
 * @param {*} str
 */
export function copyStringToClipboard(str) {
  // Create new element
  var el = document.createElement("textarea");
  // Set value (string to be copied)
  el.value = str;
  // Set non-editable to avoid focus and move outside of view
  el.setAttribute("readonly", "");
  el.style = { position: "absolute", left: "-9999px" };
  document.body.appendChild(el);
  // Select text inside element
  el.select();
  // Copy text to clipboard
  document.execCommand("copy");
  // Remove temporary element
  document.body.removeChild(el);
}

const TEMP_STATE_KEY = "temp_state_key";

export function saveStorage(state, key = TEMP_STATE_KEY) {
  localStorage.setItem(key, JSON.stringify(state));
}

export function fetchStorage(key = TEMP_STATE_KEY) {
  const res = JSON.parse(localStorage.getItem(key));
  return res;
}

export function removeStorage(key = TEMP_STATE_KEY) {
  localStorage.removeItem(key);
}

export function hashWithKeccak(seedString, message, log) {
  const seed = seedString;
  const message16 = message.toString(16);
  console.log(message16);
  const concatMessageSeed = seed.concat(message16);
  const randomValue = SHA3(concatMessageSeed, { outputLength: 256 }).toString();
  const concatMessageRandomValue = message16.concat(randomValue);
  const hashValue = SHA3(concatMessageRandomValue, {
    outputLength: 256,
  }).toString();
  const date_time = timeAndDate();
  log.push({
    date: date_time[0],
    time: date_time[1],
    val: message,
    randomVal: randomValue,
  });
  return {
    randomValue,
    hashValue,
  };
}

// DC@20-04-20: Added seed generating function, copied from InsertSeed.jsx
export function generateSeed() {
  let emptyArray = new Uint32Array(2);
  window.crypto.getRandomValues(emptyArray);
  let firstPart = emptyArray[0].toString(16);
  let secondPart = emptyArray[1].toString(16);
  console.log(firstPart.concat(secondPart));
  return firstPart.concat(secondPart);
}

export async function hashFile(file, callback) {
  await fileHash(file, MD5, function (x) {
    callback(x.toString());
  });
}

async function fileHash(file, hasher, callback) {
  //Instantiate a reader
  var reader = new FileReader();

  //What to do when we gets data?
  reader.onload = function (e) {
    var hash = hasher(e.target.result);
    callback(hash);
  };
  reader.readAsBinaryString(file);
}

export function isAddress(str) {
  var re = new RegExp("^0(x|X)[0-9a-fA-F]{40}$");
  return re.test(str);
}

export function timeAndDate() {
  const date_time = new Date();
  const date = {
    year: date_time.getFullYear(),
    month: date_time.getMonth() + 1,
    day: date_time.getDate(),
  };
  const time = {
    hour: date_time.getHours(),
    minute: date_time.getMinutes(),
    second: date_time.getSeconds(),
  };
  return [date, time];
}

export function signApproval(address, S, privateKey, log) {
  const randomValue = generateSeed();
  const message = randomValue.concat(address).concat(S).concat("approved");
  const keyInfo = Forge.pki.privateKeyFromPem(privateKey);
  const md = Forge.md.sha256.create();
  md.update(message, "utf8"); // DC@20-04-21: changed to encryptedMessage, from encryptedMessageWithInfo
  const pss = Forge.pss.create({
    md: Forge.md.sha1.create(),
    mgf: Forge.mgf.mgf1.create(Forge.md.sha1.create()),
    saltLength: 20,
  });
  const signature = keyInfo.sign(md, pss);
  const signatureHex = Forge.util.bytesToHex(signature);
  const d_t = timeAndDate();
  log.push({
    date: d_t[0],
    time: d_t[1],
    clientAdd: address,
    message: S,
    randomVal: randomValue,
  });
  return (
    SHA3(signatureHex.concat(randomValue), { outputLength: 256 }).toString(),
    signatureHex.toString(),
    randomValue,
    log
  );
}

function dateToString(date) {
  // DC@20-04-24: New function, converts date Object to 'YYYY-MM-DD'
  const day0 = date.day < 10 ? "0" : "";
  return (
    date.year +
    "-" +
    addSpacingZeroes(date.month, 2) +
    "-" +
    addSpacingZeroes(date.day, 2)
  );
}

function timeToString(time) {
  // DC@20-04-24: New function, converts time Object to 'HH:MM:SS'
  return (
    addSpacingZeroes(time.hour, 2) +
    ":" +
    addSpacingZeroes(time.minute, 2) +
    ":" +
    addSpacingZeroes(time.second, 2)
  );
}

function addSpacingZeroes(value, minWidth) {
  // DC@20-04-24: New function, pads out numerical values to specified minimum
  // width: e.g., addSpacingZeroes(345, 5) == '00345';
  // addSpacingZeroes(8, 2) == '08'; addSpacingZeroes(18, 2) == '18';
  // addSpacingZeroes(324, 2) == '324';
  const width = Math.ceil(Math.log10(value, 10));
  const zeroes = width < minWidth ? "0".repeat(minWidth - width) : "";
  return zeroes + value;
}

export function lineWrap(text, maxLength, separator = "\n") {
  if (text) {
    var wrappedText = "";
    for (var i = 0; i < text.length; i += maxLength) {
      wrappedText +=
        text.slice(i, i + maxLength) +
        (i + maxLength < text.length ? separator : "");
    }
    return wrappedText;
  } else {
    return;
  }
}

export function writeLineToLog(lineData, userRole, log) {
  // DC@20-04-24: New function, for use by client or validator page (to be
  // extended later for service user). Adds one line to a log file, which
  // records each time the client encrypts a value, or the validator signs
  // an approval. Creates the file if it doesn't already exist.
  // param lineData: an Object containing whatever fields are necessary
  // param userRole: either 'client', 'validator', or 'svc_user'
  // param log: if a log already exists, pass it to this arg, and the new
  // record will be appended to it; otherwise a new record is created

  // The line always starts with the time and date
  log = log || [];
  var line = { date: lineData.date, time: lineData.time };
  if (userRole === "client") {
    // The client's log records date, time, value encrypted, and random value
    line += "," + lineData.val + "," + lineData.randomVal;
  } else if (userRole === "validator") {
    // The validator's log records time, date, client address, signature, and
    // random value
    line +=
      "," +
      lineData.clientAddress +
      "," +
      lineData.signature +
      "," +
      lineData.randomVal;
  } else if (userRole === "svc_user") {
    // placeholder - service user yet to be implemented
    console.log("Service User doesn't yet generate log files");
    return log;
  } else {
    // in case of invalid userRole
    throw "User Role not recognised; only 'client', 'validator', and 'svc_user' are recognised.";
  }
  log.push(line);
  console.log("Added to log: " + line);
  return log;
}

// export function getTimeString() {
//   const now = new Date();
//   return `${now.getFullYear()}_${now.getMonth()}_${now.getDay()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}`;
// }
