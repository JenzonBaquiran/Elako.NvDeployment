// Form validation utility functions
export const validation = {
  // Email validation
  email: (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return null;
  },

  // Required field validation
  required: (value, fieldName) => {
    if (!value || !value.toString().trim()) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // Minimum length validation
  minLength: (value, min, fieldName) => {
    if (!value || value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  // Maximum length validation
  maxLength: (value, max, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  // Password validation
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return null;
  },

  // Password strength checker
  passwordStrength: (password) => {
    if (!password) return { strength: "none", score: 0, feedback: [] };

    let score = 0;
    const feedback = [];
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommonPatterns:
        !/^(password|123456|qwerty|abc123|admin|user|guest)$/i.test(password),
    };

    // Length check (most important)
    if (checks.length) {
      score += 2;
    } else {
      feedback.push("Use at least 8 characters");
    }

    // Character variety checks
    if (checks.lowercase) score += 1;
    else feedback.push("Add lowercase letters");

    if (checks.uppercase) score += 1;
    else feedback.push("Add uppercase letters");

    if (checks.numbers) score += 1;
    else feedback.push("Add numbers");

    if (checks.symbols) score += 2;
    else feedback.push("Add symbols (!@#$%^&*)");

    if (checks.noCommonPatterns) score += 1;
    else feedback.push("Avoid common passwords");

    // Bonus for longer passwords
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Determine strength level
    let strength;
    let color;
    if (score < 3) {
      strength = "weak";
      color = "#f44336"; // Red
    } else if (score < 6) {
      strength = "medium";
      color = "#ff9800"; // Orange
    } else {
      strength = "strong";
      color = "#4caf50"; // Green
    }

    return {
      strength,
      score,
      maxScore: 9,
      percentage: Math.round((score / 9) * 100),
      color,
      feedback,
      checks,
    };
  },

  // Password confirmation validation
  passwordConfirm: (value, password) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return null;
  },

  // Phone number validation (basic)
  phone: (value) => {
    if (!value) return "Phone number is required";
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(value)) return "Please enter a valid phone number";
    return null;
  },

  // Number validation
  number: (value, fieldName) => {
    if (!value && value !== 0) return `${fieldName} is required`;
    if (isNaN(value)) return `${fieldName} must be a valid number`;
    return null;
  },

  // Positive number validation
  positiveNumber: (value, fieldName) => {
    const numberError = validation.number(value, fieldName);
    if (numberError) return numberError;
    if (parseFloat(value) < 0) return `${fieldName} must be positive`;
    return null;
  },

  // File validation
  file: (file, fieldName, acceptedTypes = []) => {
    if (!file) return `${fieldName} is required`;
    if (acceptedTypes.length > 0) {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      const isValidType = acceptedTypes.some(
        (type) =>
          fileType.includes(type.replace(".", "")) || fileName.endsWith(type)
      );
      if (!isValidType) {
        return `${fieldName} must be one of: ${acceptedTypes.join(", ")}`;
      }
    }
    return null;
  },

  // URL validation
  url: (value, fieldName) => {
    if (!value) return null; // Optional field
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlRegex.test(value)) return `${fieldName} must be a valid URL`;
    return null;
  },
};

// Form completion checker
export const checkFormCompletion = (
  data,
  requiredFields,
  customMessages = {}
) => {
  const missingFields = [];
  const errors = {};

  requiredFields.forEach((field) => {
    const value = data[field];
    const fieldDisplayName =
      customMessages[field] ||
      field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1");

    if (!value || (typeof value === "string" && !value.trim())) {
      missingFields.push(fieldDisplayName);
      errors[
        field
      ] = `${fieldDisplayName} must be completed before proceeding.`;
    }
  });

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    errors,
    message:
      missingFields.length > 0
        ? `Please complete the following required fields to proceed: ${missingFields.join(
            ", "
          )}.`
        : "All required fields are completed.",
  };
};

// Certificate completion checker
export const checkCertificatesCompletion = (certificates) => {
  const requiredCertificates = {
    mayorsPermit: "Mayor's Permit",
    bir: "BIR Certificate",
    dti: "DTI Certificate",
  };

  const missingCertificates = [];
  const errors = {};

  Object.keys(requiredCertificates).forEach((certKey) => {
    const certFile = certificates[certKey];
    const certName = requiredCertificates[certKey];

    if (!certFile) {
      missingCertificates.push(certName);
      errors[
        certKey
      ] = `${certName} is required for business verification. Please upload this certificate to complete your registration.`;
    }
  });

  return {
    isComplete: missingCertificates.length === 0,
    missingCertificates,
    errors,
    message:
      missingCertificates.length > 0
        ? `Please upload the following required certificates to proceed: ${missingCertificates.join(
            ", "
          )}. All certificates are mandatory for business registration.`
        : "All required certificates have been uploaded.",
  };
};

// Product form completion checker
export const checkProductCompletion = (productData, productImages = []) => {
  const requiredFields = {
    productName: "Product Name",
    description: "Product Description",
    price: "Product Price",
    category: "Product Category",
  };

  const missingItems = [];
  const errors = {};

  // Check required fields
  Object.keys(requiredFields).forEach((field) => {
    const value = productData[field];
    const fieldName = requiredFields[field];

    if (!value || (typeof value === "string" && !value.trim())) {
      missingItems.push(fieldName);
      errors[
        field
      ] = `${fieldName} is required. Please provide this information to list your product.`;
    }
  });

  // Check product images
  if (!productImages || productImages.length === 0) {
    missingItems.push("Product Image");
    errors.images =
      "At least one product image is required. Please upload a clear photo of your product to attract customers.";
  }

  // Special validation for price
  if (
    productData.price &&
    (isNaN(productData.price) || parseFloat(productData.price) <= 0)
  ) {
    if (!missingItems.includes("Product Price")) {
      missingItems.push("Valid Product Price");
    }
    errors.price = "Product price must be a positive number greater than zero.";
  }

  return {
    isComplete: missingItems.length === 0,
    missingItems,
    errors,
    message:
      missingItems.length > 0
        ? `Please complete the following to list your product: ${missingItems.join(
            ", "
          )}. All fields are required to attract customers and enable sales.`
        : "Product information is complete and ready for listing.",
  };
};

// Form validation runner with completion checking
export const validateForm = (data, rules, options = {}) => {
  const {
    checkCompletion = false,
    requiredFields = [],
    customMessages = {},
    context = "form",
    checkPasswordStrength = false,
  } = options;

  const errors = {};

  // Run field-specific validation rules
  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const fieldValue = data[field];

    for (let rule of fieldRules) {
      let error = null;

      if (typeof rule === "function") {
        error = rule(fieldValue);
      } else if (typeof rule === "object") {
        const { type, params = [] } = rule;
        if (validation[type]) {
          error = validation[type](fieldValue, ...params);
        }
      }

      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  // Check password strength if requested
  let passwordStrengthResult = null;
  if (checkPasswordStrength && data.password) {
    passwordStrengthResult = validation.passwordStrength(data.password);
  }

  // Check overall completion if requested
  let completionResult = null;
  if (checkCompletion && requiredFields.length > 0) {
    completionResult = checkFormCompletion(
      data,
      requiredFields,
      customMessages
    );

    // Merge completion errors with validation errors
    Object.assign(errors, completionResult.errors);
  }

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    isValid: !hasErrors,
    hasErrors,
    completionResult,
    passwordStrengthResult,
    summary: hasErrors
      ? `Please fix the following issues before ${context} submission: ${Object.values(
          errors
        ).join(" ")}`
      : `${
          context.charAt(0).toUpperCase() + context.slice(1)
        } is ready for submission.`,
  };
};

// Hook for form validation
export const useFormValidation = (initialData, validationRules) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (field, value) => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return null;

    for (let rule of fieldRules) {
      let error = null;

      if (typeof rule === "function") {
        error = rule(value);
      } else if (typeof rule === "object") {
        const { type, params = [] } = rule;
        if (validation[type]) {
          error = validation[type](value, ...params);
        }
      }

      if (error) return error;
    }

    return null;
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      const newError = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: newError }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, data[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const allErrors = validateForm(data, validationRules);
    setErrors(allErrors);
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );
    return Object.keys(allErrors).length === 0;
  };

  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: Object.keys(errors).every((key) => !errors[key]),
    setData,
    setErrors,
  };
};

export default validation;
