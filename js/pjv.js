// Adapted from https://github.com/gorillamania/package.json-validator

const PACKAGE_FORMAT = /^[a-zA-Z0-9@\/][a-zA-Z0-9@\/\.\-_]*$/;
const VERSION_FORMAT = /^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/;
const URL_FORMAT = /^https*:\/\/[a-z.\-0-9]+/;
const EMAIL_FORMAT = /\S+@\S+/;

function validateType(name, field, value) {
  const errors = [];
  const validFieldTypes = field.types || [field.type];
  const valueType = value instanceof Array ? "array" : typeof value;
  if(validFieldTypes.indexOf(valueType) == -1) {
    errors.push("Type for field " + name + ", was expected to be " + validFieldTypes.join(" or ") + ", not " + typeof value);
  }
  return errors;
}

// Validates dependencies, making sure the object is a set of key value pairs
// with package names and versions
function validateDependencies(name, deps) {
  const errors = [];
  for (const pkg in deps) {
    if (! PACKAGE_FORMAT.test(pkg)) {
      errors.push("Invalid dependency package name: " + pkg);
    }

    if (!isValidVersionRange(deps[pkg])) {
      errors.push("Invalid version range for dependency " + pkg + ": " + deps[pkg]);
    }
  }
  return errors;
}

function isValidVersionRange(v) {
  // https://github.com/isaacs/npm/blob/master/doc/cli/json.md#dependencies
  return  (/^[\^<>=~]{0,2}[0-9.x]+/).test(v) ||
    URL_FORMAT.test(v) ||
    v == "*" ||
    v === "" ||
    v === "latest" ||
    (v.indexOf && v.indexOf("git") === 0) ||
    false;
};

function validateUrlOrMailto(name, obj) {
  const errors = [];
  if (typeof obj == "string") {
    if (!URL_FORMAT.test(obj) && !EMAIL_FORMAT.test(obj)) {
      errors.push(name + " should be an email or a url");
    }
  } else if (typeof obj == "object") {
    if (!obj.email && !obj.url && !obj.mail && !obj.web) {
      errors.push(name + " field should have one of: email, url, mail, web");
    } else {
      if (obj.email && !EMAIL_FORMAT.test(obj.email)) {
        errors.push("Email not valid for " + name + ": " + obj.email);
      }
      if (obj.mail && !EMAIL_FORMAT.test(obj.mail)) {
        errors.push("Email not valid for " + name + ": " + obj.mail);
      }
      if (obj.url && !URL_FORMAT.test(obj.url)) {
        errors.push("Url not valid for " + name + ": " + obj.url);
      }
      if (obj.web && !URL_FORMAT.test(obj.web)) {
        errors.push("Url not valid for " + name + ": " + obj.web);
      }
    }
  } else {
    errors.push("Type for field " + name + " should be a string or an object");
  }
  return errors;
}

function validatePeople (name, obj, errors) {
  errors = errors || [];

  if (Array.isArray(obj)) {
    for (const person of obj) validatePeople(name, person, errors);
    return errors;
  }

  if (typeof obj == "string") {
    const authorRegex = /^([^<\(\s]+[^<\(]*)?(\s*<(.*?)>)?(\s*\((.*?)\))?/;
    const [,name,,email,,url] = authorRegex.exec(obj);
    validatePeople({name, email, url}, errors);
  } else if (typeof obj == "object") {
    if (!obj.name) {
      errors.push(name + " field should have name");
    }
    if (obj.email && !EMAIL_FORMAT.test(obj.email)) {
      errors.push("Email not valid for " + name + ": " + obj.email);
    }
    if (obj.url && !URL_FORMAT.test(obj.url)) {
      errors.push("Url not valid for " + name + ": " + obj.url);
    }
    if (obj.web && !URL_FORMAT.test(obj.web)) {
      errors.push("Url not valid for " + name + ": " + obj.web);
    }
  } else {
    errors.push("People field must be an object or a string");
  }

  return errors;
}


function validateUrlTypes (name, obj, errors) {
  errors = errors || [];

  if (Array.isArray(obj)) {
    for (const person of obj) validateUrlTypes(name, person, errors);
    return errors;
  }

  if (typeof obj == "object") {
    if (!obj.type) errors.push(name + " field should have type");
    if (!obj.url) errors.push(name + " field should have url");
  } else if (typeof obj == "string") {
    if (!URL_FORMAT.test(obj)) {
      errors.push("Url not valid for " + name + ": " + obj);
    }
  } else {
    errors.push("Type for field " + name + " should be a string or an object");
  }

  return errors;
}

// https://npmjs.org/doc/json.html
const SPEC = {
  "name":         {"type": "string", required: true, format: PACKAGE_FORMAT},
  "version":      {"type": "string", required: true, format: VERSION_FORMAT},
  "description":  {"type": "string", warning: true},
  "keywords":     {"type": "array", warning: true},
  "homepage":     {"type": "string", recommended: true, format: URL_FORMAT},
  "bugs":         {warning: true, validate: validateUrlOrMailto},
  "licenses":     {"type": "array", warning: true, validate: validateUrlTypes, or: "license"},
  "license":      {"type": "string"},
  "author":       {warning: true, validate: validatePeople},
  "contributors": {warning: true, validate: validatePeople},
  "files":        {"type": "array"},
  "main":         {"type": "string"},
  "bin":          {"types": ["string", "object"]},
  "man":          {"types": ["string", "array"]},
  "directories":  {"type": "object"},
  "repository":   {"types": ["string", "object"], warning: true, validate: validateUrlTypes, or: "repositories"},
  "scripts":      {"type": "object"},
  "config":       {"type": "object"},
  "dependencies": {"type": "object", recommended: true, validate: validateDependencies},
  "devDependencies": {"type": "object", validate: validateDependencies},
  "bundledDependencies": {"type": "array"},
  "bundleDependencies": {"type": "array"},
  "optionalDependencies": {"type": "object", validate: validateDependencies},
  "engines":      {"type": "object", recommended: true},
  "engineStrict": {"type": "boolean"},
  "os":           {"type": "array"},
  "cpu":          {"type": "array"},
  "preferGlobal": {"type": "boolean"},
  "private":      {"type": "boolean"},
  "publishConfig": {"type": "object"},
}

export default function validate(data, options) {
  options = options || {};
  const out = {"valid": false};

  var errors = [],
    warnings = [],
    recommendations = [];

  for (const name in SPEC) {
    var field = SPEC[name];

    if (data[name] === undefined && (!field.or || field.or && data[field.or] === undefined)) {
      if (field.required) {
        errors.push("Missing required field: " + name);
      } else if (field.warning) {
        warnings.push("Missing recommended field: " + name);
      } else if (field.recommended) {
        recommendations.push("Missing optional field: " + name);
      }
      continue;
    } else if (data[name] === undefined) {
      // It's empty, but not necessary
      continue;
    }

    // Type checking
    if (field.types || field.type) {
      const typeErrors = validateType(name, field, data[name]);
      if(typeErrors.length > 0) {
        errors = errors.concat(typeErrors);
        continue;
      }
    }

    // Regexp format check
    if (field.format && !field.format.test(data[name])) {
      errors.push("Value for field " + name + ", " + data[name] + " does not match format: " + field.format.toString());
    }

    // Validation function check
    if (typeof field.validate == "function") {
      // Validation is expected to return an array of errors (empty means no errors)
      errors = errors.concat(field.validate(name, data[name]));
    }
  }

  out.valid = errors.length > 0 ? false : true;
  if (errors.length > 0) {
    out.errors = errors;
  }
  if (options.warnings !== false && warnings.length > 0) {
    out.warnings = warnings;
  }
  if (options.recommendations !== false && recommendations.length > 0) {
    out.recommendations = recommendations;
  }

  return out;
}
