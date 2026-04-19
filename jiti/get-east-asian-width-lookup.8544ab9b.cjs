"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.getCategory = getCategory;exports.isWide = exports.isFullWidth = exports.isAmbiguous = void 0;var _lookupData = require("./lookup-data.js");






var _utilities = require("./utilities.js");

const minimumAmbiguousCodePoint = _lookupData.ambiguousRanges[0];
const maximumAmbiguousCodePoint = _lookupData.ambiguousRanges.at(-1);
const minimumFullWidthCodePoint = _lookupData.fullwidthRanges[0];
const maximumFullWidthCodePoint = _lookupData.fullwidthRanges.at(-1);
const minimumHalfWidthCodePoint = _lookupData.halfwidthRanges[0];
const maximumHalfWidthCodePoint = _lookupData.halfwidthRanges.at(-1);
const minimumNarrowCodePoint = _lookupData.narrowRanges[0];
const maximumNarrowCodePoint = _lookupData.narrowRanges.at(-1);
const minimumWideCodePoint = _lookupData.wideRanges[0];
const maximumWideCodePoint = _lookupData.wideRanges.at(-1);

const commonCjkCodePoint = 0x4E_00;
const [wideFastPathStart, wideFastPathEnd] = findWideFastPathRange(_lookupData.wideRanges);

// Use a hot-path range so common `isWide` calls can skip binary search.
// The range containing U+4E00 covers common CJK ideographs;
// fallback to the largest range for resilience to Unicode table changes.
function findWideFastPathRange(ranges) {
  let fastPathStart = ranges[0];
  let fastPathEnd = ranges[1];

  for (let index = 0; index < ranges.length; index += 2) {
    const start = ranges[index];
    const end = ranges[index + 1];

    if (
    commonCjkCodePoint >= start &&
    commonCjkCodePoint <= end)
    {
      return [start, end];
    }

    if (end - start > fastPathEnd - fastPathStart) {
      fastPathStart = start;
      fastPathEnd = end;
    }
  }

  return [fastPathStart, fastPathEnd];
}

const isAmbiguous = (codePoint) => {
  if (
  codePoint < minimumAmbiguousCodePoint ||
  codePoint > maximumAmbiguousCodePoint)
  {
    return false;
  }

  return (0, _utilities.isInRange)(_lookupData.ambiguousRanges, codePoint);
};exports.isAmbiguous = isAmbiguous;

const isFullWidth = (codePoint) => {
  if (
  codePoint < minimumFullWidthCodePoint ||
  codePoint > maximumFullWidthCodePoint)
  {
    return false;
  }

  return (0, _utilities.isInRange)(_lookupData.fullwidthRanges, codePoint);
};exports.isFullWidth = isFullWidth;

const isHalfWidth = (codePoint) => {
  if (
  codePoint < minimumHalfWidthCodePoint ||
  codePoint > maximumHalfWidthCodePoint)
  {
    return false;
  }

  return (0, _utilities.isInRange)(_lookupData.halfwidthRanges, codePoint);
};

const isNarrow = (codePoint) => {
  if (
  codePoint < minimumNarrowCodePoint ||
  codePoint > maximumNarrowCodePoint)
  {
    return false;
  }

  return (0, _utilities.isInRange)(_lookupData.narrowRanges, codePoint);
};

const isWide = (codePoint) => {
  if (
  codePoint >= wideFastPathStart &&
  codePoint <= wideFastPathEnd)
  {
    return true;
  }

  if (
  codePoint < minimumWideCodePoint ||
  codePoint > maximumWideCodePoint)
  {
    return false;
  }

  return (0, _utilities.isInRange)(_lookupData.wideRanges, codePoint);
};exports.isWide = isWide;

function getCategory(codePoint) {
  if (isAmbiguous(codePoint)) {
    return 'ambiguous';
  }

  if (isFullWidth(codePoint)) {
    return 'fullwidth';
  }

  if (isHalfWidth(codePoint)) {
    return 'halfwidth';
  }

  if (isNarrow(codePoint)) {
    return 'narrow';
  }

  if (isWide(codePoint)) {
    return 'wide';
  }

  return 'neutral';
} /* v9-aafd0e54e16cc6d4 */
