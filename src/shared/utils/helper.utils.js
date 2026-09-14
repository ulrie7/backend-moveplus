/**
 * @HelperUtil
 */
module.exports = class HelperUtil {

  constructor() {

  }
  /**
   * @sleep
   * @description Delays execution for a specified time in milliseconds.
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * @getFormatCount
   * @description Formats the count into a string with leading zeros, with optional letter prefix.
   * @param {number} count - The number to format.
   * @param {number} codeSize - The desired length of the formatted string.
   * @param {boolean} withLetter - If true, adds a letter to the formatted number.
   * @returns {string} The formatted count.
   */
  getFormatCount(count, codeSize, withLetter) {
    let number = count;
    count = JSON.stringify(count);
    const len = count.length;
    const formatCount = (number, max) => {
      for (let i = 0; i < max; i++) {
        number = '0' + number;
      }
      return number;
    };
    if (codeSize >= len) {
      count = formatCount(count, codeSize - len);
      if (withLetter) {
        count = 'A' + count;
      }
    } else {
      if (withLetter) {
        const max = this.getMaximalSizeNumber(codeSize);
        const countNumber = this.countNumberInNumber(count, max, {
          fluor: true
        });
        const letter = this.getLetterFromNumber(countNumber);
        const modulo = number % max;
        if (modulo != 0) {
          count = formatCount(modulo, codeSize - JSON.stringify(modulo).length);
          count = letter + count;
        } else {
          count = letter + max;
        }
      }
    }
    return count;
  }
  /**
   * @getDownloadLink
   * @description Generates a download link from the given path.
   * @param {string} path - The file path.
   * @returns {string|null} The download link or null if no path.
   */
  getDownloadLink(path) {
    if (!path) return null;
    return process.env.BASE_URL + `/api/v1/system/download?path=${path}`;
  }
  /**
   * @beginDate
   * @description Sets the time of the given date to the beginning of the day.
   * @param {Date|string} date - The date to modify.
   * @returns {Date} The updated date with time set to 00:00.
   */
  beginDate(date) {
    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    return date;
  }
  /**
   * @endDate
   * @description Sets the time of the given date to the end of the day.
   * @param {Date|string} date - The date to modify.
   * @returns {Date} The updated date with time set to 23:59.
   */
  endDate(date) {
    date = new Date(date);
    date.setHours(23);
    date.setMinutes(59);
    return date;
  }
  /**
   * @getMaximalSizeNumber
   * @description Returns the maximal number for a given number of digits.
   * @param {number} max - Number of digits.
   * @returns {number} The maximal number with 'max' digits.
   */
  getMaximalSizeNumber(max) {
    let number = "";
    for (let i = 0; i < max; i++) {
      number += "9";
    }
    return Number(number);
  }
  /**
   * @getLetterFromNumber
   * @description Returns a letter corresponding to the provided number (1-5).
   * @param {number} number - The number to convert to a letter.
   * @returns {string} The corresponding letter.
   */
  getLetterFromNumber(number) {
    switch (number) {
      case 1:
        return 'A';
      case 2:
        return 'B';
      case 3:
        return 'C';
      case 4:
        return 'D';
      case 5:
        return 'E';
      default:
        return '';

    }
  }
  /**
   * @countNumberInNumber
   * @description Counts how many times a number can fit into another, optionally rounding up.
   * @param {number} number - The original number.
   * @param {number} divide - The divisor.
   * @param {Object} filter - Filter options.
   * @returns {number} The count.
   */
  countNumberInNumber(number, divide, filter = {
    fluor: false
  }) {
    const {
      fluor
    } = filter;
    const modulo = number % divide;
    let count = (number - modulo) / divide;
    if (fluor && modulo != 0) count++;
    return count;
  }
  /**
   * @generateCodeFromModelCount
   * @description Generates a formatted code based on the model count.
   * @param {Object} Model - The Mongoose model.
   * @param {Object} filter - Additional options like codeSize and withLetter.
   * @returns {Promise<string>} The generated code.
   */
  async generateCodeFromModelCount(Model, filter) {
    const {
      codeSize,
      withLetter
    } = filter;
    let {
      modelSchema,
      addCount
    } = filter;

    if (!modelSchema) modelSchema = {};
    let count = await Model.count(modelSchema);
    if (addCount) count += addCount;
    count = this.getFormatCount(count, codeSize, withLetter);
    return count;
  }
  /**
   * @generateId
   * @description Generates a random string of a specified length, with an option to include letters or only numbers.
   */
  generateId(length, string = true) {
    var result = "";
    var characters = string ? "abcdefghijklmnopqrstuvwxyz0123456789" : "0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return result;
  }
  /**
   * @generateObjectId
   * @description Generates a MongoDB ObjectId from a provided string or defaults to "123456789012".
   */
  generateObjectId(str = "123456789012") {
    const ObjectId = require("mongoose").Types.ObjectId;
    return new ObjectId(str);
  }
  /**
   * @isValidObjectId
   * @description Check if id is a valid Object Id.
   */
  isValidObjectId(id) {
    return require("mongoose").Types.ObjectId.isValid(id);
  }
  /**
   * @getObsoleteDate
   * @description Returns a fixed obsolete date (January 1, 2001).
   */
  getObsoleteDate() {
    return new Date("01-01-2001");
  }
  /**
   * @generateSlug
   * @description Generates a URL-friendly slug from a given name, replacing special characters with hyphens.
   */
  generateSlug(input = "") {
    const slugify = require('slugify');
    return slugify(input, {
      lower: true, // Convert to lowercase
      strict: true, // Remove special characters
    }) + "-" + this.generateId(10);
  }
  /**
   * @doubleNumber
   * @description Ensures that a number is always represented with two digits, adding a leading zero if necessary.
   */
  doubleNumber(nmb) {
    if (!parseInt(nmb) && parseInt(nmb) != 0) return null;
    return parseInt(nmb) > 9 ? nmb : `0${nmb}`;
  }
  /**
   * @getDateFormat
   * @description Formats a date into a string with optional French formatting and separator.
   */
  getDateFormat(date, frenchFormat = false, separator = "-") {
    if (!date || date == null) return null;

    date = new Date(date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const theDate = date.getDate();
    const doubleNumber = (nmb) => {
      return parseInt(nmb) > 9 ? nmb : `0${nmb}`;
    };

    if (frenchFormat == false) {
      return `${year}${separator}${doubleNumber(month)}${separator}${doubleNumber(theDate)}`;
    } else {
      return `${doubleNumber(theDate)}${separator}${doubleNumber(month)}${separator}${year}`;

    }
  }
  /**
   * @getHourFormat
   * @description Formats a date to show hours and minutes with two digits each.
   */
  getHourFormat(date) {
    if (!date || date == null) return null;

    date = new Date(date);
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const doubleNumber = (nmb) => {
      return parseInt(nmb) > 9 ? nmb : `0${nmb}`;
    };

    return `${doubleNumber(hours)}:${doubleNumber(minutes)}`;
  }
  /**
   * @getTimeFormat
   * @description Combines date and hour formats into a complete timestamp string.
   */
  getTimeFormat(date, frenchFormat = true) {
    if (!date || date == null) return null;
    return `${this.getDateFormat(date, frenchFormat)} ${this.getHourFormat(date)}`;
  }
  /**
   * @dateFieldsFormatAlgo
   * @description Formats date fields in an item according to the given fields array.
   */
  dateFieldsFormatAlgo(item, fields) {
    if (!item) return null;

    for (let a = 0; a < fields.length; a++) {
      const field = fields[a];
      if (field.includes('.')) {
        const splitField = field.split('.');
        item._doc[splitField[0]][splitField[1]] = this.getDateFormat(item[splitField[0]][splitField[1]]);
      } else if (item[fields[a]]) {
        if (item._doc) {
          item._doc[fields[a]] = this.getDateFormat(item[fields[a]]);
          item._doc[fields[a] + "Fr"] = this.getDateFormat(item[fields[a]], true);
        } else {
          item[fields[a]] = this.getDateFormat(item[fields[a]]);
          item[fields[a] + "Fr"] = this.getDateFormat(item[fields[a]], true);
        }
      }

    }
  }
  /**
   * @dateTimeFieldsFormatAlgo
   * @description Formats date-time fields in an item according to the given fields array.
   */
  dateTimeFieldsFormatAlgo(item, fields) {
    if (!item) return null;

    for (let a = 0; a < fields.length; a++) {
      const field = fields[a];
      if (field.includes('.')) {
        const splitField = field.split('.');
      } else if (item[fields[a]]) {
        item._doc[fields[a] + "Time"] = this.getTimeFormat(item[fields[a]], true);
      }

    }
  }
  /**
   * @currentMonthSchema
   * @description Returns a schema for the current month.
   */
  currentMonthSchema() {
    const date = new Date();
    const schema = {
      $gte: new Date(`${date.getFullYear()}-${date.getMonth() + 1}-01`),
      $lt: new Date(`${date.getFullYear()}-${date.getMonth() + 2}-01`),
    };
    return schema;
  }
  /**
   * @currentYearSchema
   * @description Returns a schema for the current year.
   */
  currentYearSchema() {
    const date = new Date();
    const schema = {
      $gte: new Date(`${date.getFullYear()}-01-01`),
      $lt: new Date(`${date.getFullYear()}-12-31`),
    };
    return schema;
  }
  /**
   * @currentDaySchema
   * @description Returns a schema for the current day.
   */
  currentDaySchema() {
    const date = new Date();
    const schema = {
      $gte: new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`),
      $lt: new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`),
    };
    return schema;
  }
  /**
   * @getPeriodSchema
   * @description Generates a schema for a period based on the query parameters.
   */
  getPeriodSchema(query) {
    const schema = {
      createdAt: this.currentDaySchema()
    };

    const {
      withoutPeriod,
      periodStartDate,
      periodEndDate,
      currentYear
    } = query;

    if (withoutPeriod && JSON.parse(withoutPeriod) === true) {
      delete schema.createdAt;
    } else if (currentYear && JSON.parse(currentYear) === true) {
      schema.createdAt = this.currentYearSchema();
    } else {
      if (periodStartDate) {
        schema.createdAt = {
          $gte: this.beginDate(new Date(periodStartDate))
        };
      }
      if (periodEndDate) {
        schema.createdAt = {
          ...schema.createdAt,
          $lte: this.endDate(new Date(periodEndDate))
        };
      }
    }

    return schema.createdAt ? schema.createdAt : {
      $exists: true
    };
  }
  /**
   * @generateDayPeriodSchema
   * @description Generates a schema for a period of days from the current date.
   */
  generateDayPeriodSchema(day, filter = {}) {
    if (!Number.isInteger(day)) return false;

    const date = new Date();
    const ltDate = new Date(date);
    ltDate.setDate(ltDate.getDate() + day);
    ltDate.setHours(23);
    ltDate.setMinutes(59);

    let schema = {
      $gte: new Date(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 00:00`),
      $lt: ltDate,
    };

    if (filter.isLt) {
      const isLtDate = new Date(date);
      isLtDate.setHours(23);
      isLtDate.setMinutes(59);
      schema = {
        $lt: isLtDate,
      };
    }

    return schema;
  }
  /**
   * @returnUniqueObjectArray
   * @description Returns an array of unique objects based on a specified key.
   */
  returnUniqueObjectArray(array, key) {
    return [...new Map(array.map(item => [item[key], item])).values()];
  }
  /**
   * @onlyUniqueArrayFilter
   * @description Returns a boolean indicating if an array value is unique.
   */
  onlyUniqueArrayFilter(value, index, self) {
    return self.indexOf(value) === index;
  }
  /**
   * @returnUniqueArray
   * @description Filters an array to return only unique values.
   */
  returnUniqueArray(array) {
    return array.filter(this.onlyUniqueArrayFilter);
  }
  /**
   * @deletePaths
   * @description Deletes files at specified paths.
   */
  deletePaths(paths) {
    const fs = require("fs");
    const {
      unlink
    } = require("fs-extra");
    if (!Array.isArray(paths)) return true;
    for (let path of paths) {
      if (fs.existsSync(path)) {
        unlink(path);
      }
    }
  }
  /**
   * @appendQueryParams
   * @description Append Query params.
   */
  appendQueryParams(route, queryObject) {
    if (typeof queryObject != 'object' || !route)

      return route

    const queryString = Object.keys(queryObject)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(queryObject[key]))
      .join('&');

    return queryString ? route + '?' + queryString : route;
  }
  /**
   * @getPaginationNextPage
   * @description Get Pagination next page.
   */
  getPaginationNextPage(options) {
    const {
      currentPage,
      totalPages,
      query,
      route
    } = options

    const page = Number(currentPage) < Number(totalPages) ? Number(currentPage) + 1 : null;

    if (page) {
      query.page = page

      return this.appendQueryParams(route, query)
    }
    return null
  }
  /**
   * @getPaginationPreviousPage
   * @description Get Pagination previous page.
   */
  getPaginationPreviousPage(options) {
    const {
      currentPage,
      query,
      route
    } = options

    const page = Number(currentPage) > 1 ? Number(currentPage) - 1 : null;

    if (page) {
      query.page = page
      return this.appendQueryParams(route, query)
    }

    return null
  }
  /**
   * @getValidTrimData
   * @description Get valid trim date.
   */
  getValidTrimData(data) {
    if (typeof data == 'string')
      return data.trim()
    return data;
  }
  /**
   * @issetData
   * @description Is Set Data.
   */
  issetData(data) {
    if (!data && data != 0 && data != false)
      return data
    if (typeof data == 'string')
      data = data.trim()

    if (Number.isInteger(Number(data))) {
      return data || data == 0
    }
    if (!Number.isNaN(Number(data))) {
      return data || data == 0
    }
    if (typeof data == 'string')
      return data.trim()
    if (typeof data == 'number')
      return data || data == 0
    if (typeof data == 'boolean')
      return data || data == false
    return data;
  }
  /**
   * @generateBcryptHash
   * @description Generate Bcrypt Hash.
   */
  async generateBcryptHash(password) {
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
  /**
   * Adds a specified number of months to a given date.
   *
   * @param {string} startDate - The starting date in 'YYYY-MM-DD' format. Defaults to today if not provided.
   * @param {number} monthsToAdd - The number of months to add. Defaults to 0 if not provided.
   * @param {string} dateFormat - The output format for the date. Defaults to 'YYYY-MM-DD'.
   * @returns {string} - The resulting date in the specified format.
   */
  addMonthsToDate(startDate = undefined, monthsToAdd = 0, dateFormat = "YYYY-MM-DD") {
    const moment = require('moment')
    const date = startDate ? moment(startDate, dateFormat, true) : moment();

    if (!date.isValid()) {
      throw new Error('Invalid startDate format. Use "YYYY-MM-DD".');
    }

    return date.add(monthsToAdd, 'months').format(dateFormat);
  }
  /**
   * @escapeRegex
   * @description Escape regex
   */
  escapeRegex(value) {
    if (typeof value != 'string') return value
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special chars
  }

}