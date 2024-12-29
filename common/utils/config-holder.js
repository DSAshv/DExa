let config = {};

class ConfigHolder {
  static get config() {
    return config;
  }

  static set config(_config) {
    config = _config || {};
  }

  static get isAuthorized() {
    return Boolean(config.authorized) || false;
  }

  static get origin() {
    return config.origin || window.location.origin;
  }

  static get id() {
    return config.userInfo?._id || "";
  }

  static get name() {
    return config.userInfo?.name || "";
  }

  static get examId() {
    return config.examId || "";
  }

  static get examInfo() {
    return config.examInfo || {};
  }

  static get role() {
    return config.userInfo?.role || "";
  }

  static get email() {
    return config.userInfo?.email || "";
  }

  static get dateOfBirth() {
    return config.userInfo?.dateOfBirth || "";
  }

  static get location() {
    return config.userInfo?.location || "";
  }

  static get pincode() {
    return config.userInfo?.pincode || "";
  }

  static get isStudent() {
    return config.userInfo?.role === "student";
  }

  static get isOrgAdmin() {
    return config.userInfo?.role === "orgAdmin";
  }

  static get isSuperAdmin() {
    return config.userInfo?.role === "superAdmin";
  }

  static get getExamMode() {
    if (config.message) {
      return config.message;
    }
    return "";
  }
  static get hasExamMode() {
    return !!config.message;
  }
}

export { ConfigHolder, ConfigHolder as default };
