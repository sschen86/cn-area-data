function decode(encodeText) {
  // console.info("encodeText");
  const [
    splitAlphabetMeta,
    splitToken2normalTokenDictionary,
    normalTextDictionary,
    encodeNamesText,
    codeAlphabetMeta,
    codeTokenDictionary,
    encodeCodesText,
  ] = encodeText.split("\n");

  const alphabet = createAlphabet();

  const [
    provinceSplitAlphabet,
    citySplitAlphabet,
    countrySplitAlphabet,
    normalAlphabet,
    normalSingleAlphabet,
    normalDoubleAlphabet,
  ] = createEncodeAlphabets();

  const [
    provinceSplitTable,
    citySplitTable,
    countrySplitTable,
    normalTextTable,
  ] = createDecodeTables();

  const codes = decodeCodes();

  return decode();

  // 生成字母表
  function createAlphabet() {
    // https://www.runoob.com/w3cnote/ascii.html
    // 95个打印字符，排除（34 双引号）、（39 单引号）、（92 反斜杠）3个可见字符，剩余92个
    const excludeCharCodes = [34, 39, 92];
    const alphabet = [];
    for (let code = 32; code < 127; code++) {
      if (excludeCharCodes.includes(code)) {
        continue;
      }
      alphabet.push(String.fromCharCode(code));
    }

    // console.log({ alphabet });

    return alphabet;
  }

  // 生成编码字母表
  function createEncodeAlphabets() {
    const [
      provinceSplitAlphabetLength,
      citySplitAlphabetLength,
      countrySplitAlphabetLength,
    ] = splitAlphabetMeta.split("").map((item) => parseInt(item, 36));

    const provinceSplitAlphabet = alphabet.slice(
      0,
      provinceSplitAlphabetLength
    );
    const citySplitAlphabet = alphabet.slice(
      provinceSplitAlphabetLength,
      provinceSplitAlphabetLength + citySplitAlphabetLength
    );
    const countrySplitAlphabet = alphabet.slice(
      provinceSplitAlphabetLength + citySplitAlphabetLength,
      provinceSplitAlphabetLength +
        citySplitAlphabetLength +
        countrySplitAlphabetLength
    );
    const normalAlphabet = alphabet.slice(
      provinceSplitAlphabetLength +
        citySplitAlphabetLength +
        countrySplitAlphabetLength
    );

    // 生成文案编码
    const texts = normalTextDictionary.split("");
    const [singleAlphabetLength, doubleAlphabetLength] = pickEncodeChartInfo(
      texts.length,
      normalAlphabet.length
    );

    const normalSingleAlphabet = normalAlphabet.slice(0, singleAlphabetLength);
    const normalDoubleAlphabet = normalAlphabet.slice(
      singleAlphabetLength,
      singleAlphabetLength + doubleAlphabetLength
    );

    // console.log({
    //   alphabet,
    //   provinceSplitAlphabet,
    //   citySplitAlphabet,
    //   countrySplitAlphabet,
    //   normalAlphabet,
    //   normalSingleAlphabet,
    //   normalDoubleAlphabet,
    // });

    return [
      provinceSplitAlphabet,
      citySplitAlphabet,
      countrySplitAlphabet,
      normalAlphabet,
      normalSingleAlphabet,
      normalDoubleAlphabet,
    ];
  }

  // 生成编码文本映射表
  function createDecodeTables() {
    const normalTextTable = createTextTable(
      normalTextDictionary.split(""),
      normalAlphabet
    );

    const provinceSplitTable = {};
    const citySplitTable = {};
    const countrySplitTable = {};

    // 解析“省市区”编码，做映射，首先解码normalToken，再映射成splitToken
    let token = "";
    const normalTokenAlphabets = splitToken2normalTokenDictionary.split("");
    for (let i = 0; i < normalTokenAlphabets.length; i++) {
      token = normalTokenAlphabets[i];
      if (normalDoubleAlphabet.includes(token)) {
        token += normalTokenAlphabets[++i];
      }

      const text = normalTextTable[token];

      if (provinceSplitAlphabet.length) {
        provinceSplitTable[provinceSplitAlphabet.shift()] = text;
      } else if (citySplitAlphabet.length) {
        citySplitTable[citySplitAlphabet.shift()] = text;
      } else if (countrySplitAlphabet.length) {
        countrySplitTable[countrySplitAlphabet.shift()] = text;
      }
    }

    // console.log({
    //   provinceSplitTable,
    //   citySplitTable,
    //   countrySplitTable,
    //   normalTextTable,
    // });

    return [
      provinceSplitTable,
      citySplitTable,
      countrySplitTable,
      normalTextTable,
    ];
  }

  // 创建文本映射token的表
  function createTextTable(texts, alphabet) {
    const [singleTokenLength, dobleTokenLength] = pickEncodeChartInfo(
      texts.length,
      alphabet.length
    );

    const table = {};

    const singleText = texts.slice(0, singleTokenLength);
    singleText.forEach((text, i) => {
      table[alphabet[i]] = text;
    });

    const doubleAlphabet = alphabet.slice(singleTokenLength);
    const doubleText = texts.slice(singleTokenLength);
    doubleText.forEach((text, i) => {
      const i1 = Math.floor(i / doubleAlphabet.length);
      const i2 = i % doubleAlphabet.length;

      table[doubleAlphabet[i1] + doubleAlphabet[i2]] = text;
    });

    return table;
  }
  // 创建待编码的字符信息
  function pickEncodeChartInfo(S, M) {
    let minSize = Number.MAX_VALUE;
    let minNums = [M, M, M];

    // console.info("Input:", S, M);

    // console.info(S, M);

    for (let a = M; a >= 0; a--) {
      for (let b = M; b >= 0; b--) {
        for (let c = M; c >= 0; c--) {
          if (
            a + (b === 0 ? 0 : b ** 2) + (c === 0 ? 0 : c ** 3) >= S &&
            a + b + c <= M
          ) {
            const aCount = a; // 使用单字符映射的数据
            const bCount = c === 0 ? S - aCount : b ** 2; // 使用双字节映射的数据
            const cCount = Math.max(0, S - aCount - bCount); // 使用三字节映射的数据
            const curSize = aCount + 2 * bCount + 3 * cCount; // 最终表示S长度的所有数据的字节长度

            if (curSize <= minSize) {
              minSize = curSize;
              minNums = [a, b, c];

              // console.info({ a, b, c });
              // console.info({ aCount, bCount, cCount, curSize });
            }
          }
        }
      }
    }

    return minNums;
  }

  function decode() {
    // 使用状态机进行解压
    const encodeNames = encodeNamesText.split("");
    let state = "ReadProvince";
    let cursor = 0;
    let char;
    let token;
    let word = "";

    const provinces = [];
    let province = null;
    let city = null;

    let provinceCode = null;
    let cityCode = null;
    let countryCode = null;
    let prevProvinceCode = null;
    let prevCityCode = null;
    let provinceCodeText = null;
    let cityCodeText = null;
    let prevCountryCode = null;

    // eslint-disable-next-line no-cond-assign
    while ((char = encodeNames[cursor])) {
      token = char;
      if (normalDoubleAlphabet.includes(char)) {
        cursor++;
        token += encodeNames[cursor];
      }

      //  解析省数据
      if (state === "ReadProvince") {
        if (provinceSplitTable[token]) {
          readProvince(token);
        } else {
          readWord(token);
        }
      }
      // 解析市数据
      else if (state === "ReadCity") {
        if (citySplitTable[token]) {
          readCity(token);
        } else {
          readWord(token);
        }
      }
      // 解析县数据
      else if (state === "ReadCountry") {
        if (countrySplitTable[token]) {
          readCountry(token);
        } else {
          readWord(token);
        }
      }
      // 其他
      else if (state === "ReadUnkown") {
        if (provinceSplitTable[token]) {
          readProvince(token);
        } else if (citySplitTable[token]) {
          readCity(token);
        } else if (countrySplitTable[token]) {
          readCountry(token);
        } else {
          readWord(token);
        }
      }

      cursor++;
    }

    // console.info({ provinces });

    return provinces;

    function readWord(token) {
      word += normalTextTable[token];
    }

    function readProvince(token) {
      word += provinceSplitTable[token];

      provinces.push(
        (province = {
          code: readProvinceCode(),
          name: word,
          children: [],
        })
      );
      state = "ReadCity";
      word = "";
    }

    function readCity(token) {
      word += citySplitTable[token];

      province.children.push(
        (city = {
          code: readCityCode(),
          name: word,
          children: [],
        })
      );
      state = "ReadCountry";
      prevCountryCode = null;
      word = "";
    }

    function readCountry(token) {
      word += countrySplitTable[token];

      city.children.push({
        code: readCountryCode(),
        name: word,
      });
      state = "ReadUnkown";
      word = "";
    }

    function readProvinceCode() {
      const code = codes.shift();

      if (prevProvinceCode) {
        provinceCode = prevProvinceCode + code;
      } else {
        provinceCode = code;
      }

      prevProvinceCode = provinceCode;
      prevCityCode = cityCode = null;

      return (provinceCodeText = String(provinceCode));
    }

    function readCityCode() {
      const code = codes.shift();

      if (prevCityCode) {
        cityCode = prevCityCode + code;
      } else {
        cityCode = code;
      }

      prevCityCode = cityCode;

      return (cityCodeText = provinceCode + String(cityCode).padStart(2, "0"));
    }

    function readCountryCode() {
      const code = codes.shift();

      if (prevCountryCode) {
        countryCode = prevCountryCode + code;
      } else {
        countryCode = code;
      }

      prevCountryCode = countryCode;

      return (
        cityCodeText +
        (countryCode > 100000
          ? String(countryCode).slice(1)
          : String(countryCode).padStart(2, "0"))
      );
    }
  }

  function decodeCodes() {
    const codeTable = createCodeTable();

    const [mutipleOneToken, oneDic] = codeAlphabetMeta.split("");
    // 解码codes数据，第一步先将多个重复的1解压出来
    const encodeCodes = encodeCodesText
      .replace(RegExp(`${mutipleOneToken}(.)`, "g"), (match, d36) =>
        oneDic.repeat(parseInt(d36, 36))
      )
      .split("")
      .map((token) => codeTable[token]);

    return encodeCodes;

    function createCodeTable() {
      // 初始化code表，用于解码code
      const codeTable = {};
      const codeTokens = alphabet.slice();
      codeTokenDictionary.replace(
        /(..)-(..)|(25..)|(..)/g,
        (match, start, end, d2536, d36) => {
          if (d36) {
            const num = parseInt(d36, 36);
            codeTable[codeTokens.shift()] = num;
            // console.info({ num, d36 });
          } else if (d2536) {
            const num = parseInt(d2536, 36);
            codeTable[codeTokens.shift()] = num;
            // console.info({ num, d2536 });
          } else {
            const startNum = parseInt(start, 36);
            const endNum = parseInt(end, 36);

            for (let i = startNum; i <= endNum; i++) {
              codeTable[codeTokens.shift()] = i;
            }

            // console.info({ startNum, endNum });
          }
        }
      );

      // console.info({ codeTable });

      return codeTable;
    }
  }
}

document.getElementById("doDecode").onclick = function () {
  document.getElementById("decodeAreaData").value = JSON.stringify(
    decode(document.getElementById("encodeAreaData").value),
    null,
    2
  );

  console.info(
    document.getElementById("rawAreaData").value ===
      document.getElementById("decodeAreaData").value
  );
};

// document.getElementById("doDecode").onclick();
