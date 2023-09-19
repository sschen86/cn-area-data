function encode(rawData) {
  const areaData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  const [provinceTexts, cityTexts, countryTexts, allTexts] =
    createTextStatistic();
  const alphabet = createAlphabet();
  const [
    provinceSplitAlphabet,
    citySplitAlphabet,
    countrySplitAlphabet,
    normalAlphabet,
  ] = createEncodeAlphabets();
  const [
    provinceSplitTable,
    citySplitTable,
    countrySplitTable,
    normalTextTable,
  ] = createEncodeTables();

  return encode();

  // 生成字符统计信息
  function createTextStatistic() {
    // 对“省/市/区”中出现的中文字符进行统计，根据出现的次数进行降序来制定压缩策略，同时提取结尾字符进行独立编码，用于解码时的数据识别
    const allTexts = { all: [] };
    const provinceTexts = { all: [], normal: [], split: [] };
    const cityTexts = { all: [], normal: [], split: [] };
    const countryTexts = { all: [], normal: [], split: [] };
    const textsAll = allTexts.all;

    areaData.forEach(({ name, children }) => {
      walkText(provinceTexts, name);
      children.forEach(({ name, children }) => {
        walkText(cityTexts, name);
        children.forEach(({ name }) => {
          walkText(countryTexts, name);
        });
      });
    });

    sortTexts();

    // console.log({ provinceTexts, cityTexts, countryTexts, allTexts });

    return [provinceTexts, cityTexts, countryTexts, allTexts];

    function walkText(whichTexts, name) {
      const { all, normal, split } = whichTexts;
      name.split("").forEach((text, i) => {
        const which = i === name.length - 1 ? split : normal;

        if (!which[text]) {
          which[text] = {
            value: text,
            count: 0,
          };
          which.push(which[text]);
        }
        which[text].count++;

        if (!all[text]) {
          all[text] = {
            value: text,
            count: 0,
          };
          all.push(all[text]);
        }
        all[text].count++;

        if (!textsAll[text]) {
          textsAll.push(
            (textsAll[text] = {
              value: text,
              count: 0,
            })
          );
        }
        textsAll[text].count++;
      });
    }

    function sortTexts() {
      [provinceTexts, cityTexts, countryTexts, allTexts].forEach((item) => {
        Object.keys(item).forEach((key) => {
          item[key] = item[key]
            .slice()
            .sort((a, b) => (a.count > b.count ? -1 : 0));
        });
      });
    }
  }

  // 生成字母表
  function createAlphabet() {
    // https://www.runoob.com/w3cnote/ascii.html
    // 95个打印字符，排除（34 双引号）、（39 单引号）、（92 反斜杠）3个可见字符，剩余92个
    const excludeCharCodes = [34, 39, 92];
    const alphabet = [];
    for (let code = 32; code < 127; code++) {
      if (excludeCharCodes.includes(code)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      alphabet.push(String.fromCharCode(code));
    }

    // console.log({ alphabet });

    return alphabet;
  }

  // 生成编码字母表
  function createEncodeAlphabets() {
    const provinceSplitAlphabetLength = provinceTexts.split.length;
    const citySplitAlphabetLength = cityTexts.split.length;
    const countrySplitAlphabetLength = countryTexts.split.length;

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

    // console.log({
    //   alphabet,
    //   provinceSplitAlphabet,
    //   citySplitAlphabet,
    //   countrySplitAlphabet,
    //   normalAlphabet,
    // });

    return [
      provinceSplitAlphabet,
      citySplitAlphabet,
      countrySplitAlphabet,
      normalAlphabet,
    ];
  }

  // 生成编码文本映射表
  function createEncodeTables() {
    const normalTextTable = createTextTable(
      allTexts.all.map((item) => item.value),
      normalAlphabet
    );

    const provinceSplitTable = createTextTable(
      provinceTexts.split.map((item) => item.value),
      provinceSplitAlphabet
    );

    const citySplitTable = createTextTable(
      cityTexts.split.map((item) => item.value),
      citySplitAlphabet
    );

    const countrySplitTable = createTextTable(
      countryTexts.split.map((item) => item.value),
      countrySplitAlphabet
    );

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
      table[text] = alphabet[i];
    });

    const doubleAlphabet = alphabet.slice(singleTokenLength);
    const doubleText = texts.slice(singleTokenLength);
    doubleText.forEach((text, i) => {
      const i1 = Math.floor(i / doubleAlphabet.length);
      const i2 = i % doubleAlphabet.length;

      table[text] = doubleAlphabet[i1] + doubleAlphabet[i2];
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

  function encode() {
    const [encodeNames, encodeCodes] = walkNodes();

    // 分割信息
    const splitAlphabetMeta = [
      provinceSplitAlphabet,
      citySplitAlphabet,
      countrySplitAlphabet,
    ]
      .map((item) => item.length.toString(36))
      .join("");

    // 分割token映射常规token的字典
    const splitToken2normalTokenDictionary = createSplitTokenDirctionary();

    // 常规文本字典
    const normalTextDictionary = allTexts.all
      .map((item) => item.value)
      .join("");

    // 编码的名称数据
    const encodeNamesText = encodeNames.join("");

    const [codeAlphabetMeta, codeTokenDictionary, encodeCodesText] =
      transformEncodeCodes();

    // console.info({
    //   splitAlphabetMeta,
    //   splitToken2normalTokenDictionary,
    //   normalTextDictionary,
    //   encodeNamesText,
    // });

    return [
      splitAlphabetMeta,
      splitToken2normalTokenDictionary,
      normalTextDictionary,
      encodeNamesText,
      codeAlphabetMeta,
      codeTokenDictionary,
      encodeCodesText,
    ].join("\n");

    function walkNodes() {
      const encodeNames = [];
      const encodeCodes = [];
      let prevProvinceCode = null;
      let prevCityCode = null;
      let prevCountryCode = null;

      areaData.forEach(({ code, name, children }) => {
        encodeProvinceCode(code);
        encodeName(name, provinceSplitTable);
        children.forEach(({ code, name, children }) => {
          encodeCityCode(code);
          encodeName(name, citySplitTable);
          children.forEach(({ code, name }) => {
            encodeCountryCode(code);
            encodeName(name, countrySplitTable);
          });
        });
      });

      // console.info({ encodeNames, encodeCodes });

      return [encodeNames, encodeCodes];

      function encodeName(name, splitTable) {
        const texts = name.split("");
        const splitText = texts.pop();
        encodeNames.push(...texts.map((text) => normalTextTable[text]));
        encodeNames.push(splitTable[splitText]);
      }

      function encodeProvinceCode(code) {
        const provinceCode = Number(code);
        if (prevProvinceCode) {
          encodeCodes.push(provinceCode - prevProvinceCode);
        } else {
          encodeCodes.push(provinceCode);
        }
        prevProvinceCode = provinceCode;
        prevCityCode = null;
      }

      function encodeCityCode(code) {
        const cityCode = Number(code.slice(2));
        if (prevCityCode) {
          encodeCodes.push(cityCode - prevCityCode);
        } else {
          encodeCodes.push(cityCode);
        }
        prevCityCode = cityCode;
        prevCountryCode = null;
      }

      function encodeCountryCode(code) {
        const countryCode = Number(code.slice(4));

        if (prevCountryCode) {
          encodeCodes.push(countryCode - prevCountryCode);
        }
        // 类似广东省东莞市下的一些区域
        else if (code.slice(4).length === 5) {
          encodeCodes.push(Number(1 + code.slice(4)));
        } else {
          encodeCodes.push(countryCode);
        }
        prevCountryCode = countryCode;
      }
    }

    function createSplitTokenDirctionary() {
      const splitTokenDictionary = [];
      [provinceTexts, cityTexts, countryTexts].forEach(({ split }) => {
        split.forEach(({ value }) => {
          splitTokenDictionary.push(normalTextTable[value]);
        });
      });

      return splitTokenDictionary.join("");
    }

    function transformEncodeCodes() {
      const codeSet = Array.from(
        new Set(encodeCodes.slice().sort((a, b) => (a < b ? -1 : 0)))
      );
      // 对连续的数字进行合并处理
      //  [0,1,2,3,4,6,8,9,10,12,22] => 0-468-101222
      let group = [];
      let codeTokenDictionary = "";
      let prevCode = 0;
      codeSet.forEach((code) => {
        // 下一个字符和上一个不是连续的，结束分组
        if (code - prevCode > 1) {
          readGroup();
          group = [code];
        } else {
          group.push(code);
        }
        prevCode = code;
      });

      readGroup();

      const codeAlphabet = alphabet.slice();
      const mutipleOneToken = codeAlphabet.pop();
      const codeTable = createTextTable(codeSet, codeAlphabet);
      const codeAlphabetMeta = mutipleOneToken + codeTable[1];

      const encodeCodesText = encodeCodes
        .map((code) => codeTable[code])
        .join("")
        .replace(RegExp(`${codeTable[1]}+`, "g"), (match) => {
          return mutipleOneToken + match.length.toString(36);
        });

      // console.log({
      //   codeTokenDictionary,
      //   codeAlphabetMeta,
      //   encodeCodesText,
      // });

      // console.log({ codeTable });

      return [codeAlphabetMeta, codeTokenDictionary, encodeCodesText];

      function to36(code) {
        return code.toString(36).padStart(2, "0");
      }

      // 读取下一组
      function readGroup() {
        if (group.length === 0) {
          return;
        }
        if (group.length > 2) {
          codeTokenDictionary += `${to36(group[0])}-${to36(group.pop())}`;
        } else {
          codeTokenDictionary += group.map((code) => to36(code)).join("");
        }
        group = [];
      }
    }
  }
}

document.getElementById("doEncode").onclick = function () {
  document.getElementById("encodeAreaData").value = encode(
    document.getElementById("rawAreaData").value
  );

  document.getElementById("rawAreaData").onscroll = function () {
    document.getElementById("decodeAreaData").scrollTo({ top: this.scrollTop });
  };
  document.getElementById("decodeAreaData").onscroll = function () {
    document.getElementById("rawAreaData").scrollTo({ top: this.scrollTop });
  };

  const enc = new TextEncoder();

  const rawDataByteLength = enc.encode(
    document.getElementById("rawAreaData").value.replace(/\s/g, "")
  ).byteLength;
  const encodeDataByteLength = enc.encode(
    document.getElementById("encodeAreaData").value
  ).byteLength;

  document.getElementById("encodeInfo").innerHTML =
    "原始数据的大小为：" +
    rawDataByteLength +
    "字节；" +
    "压缩后的代码大小为：" +
    encodeDataByteLength +
    "字节；" +
    "压缩率为：" +
    ((encodeDataByteLength / rawDataByteLength) * 100).toFixed(2) +
    "%";

  console.info(
    enc.encode(document.getElementById("rawAreaData").value.replace(/\s/g, ""))
      .byteLength,
    enc.encode(document.getElementById("encodeAreaData").value).byteLength
  );
};

// document.getElementById("doEncode").onclick();
