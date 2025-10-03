const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

const isValidCountryCode = (countryCode) => {
  const countryCodeRegex = /^\+[1-9]\d{0,3}$/;
  return countryCodeRegex.test(countryCode);
};


const isValidFileExtension = (filename, allowedExtensions = ['.csv', '.xlsx', '.xls']) => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(ext);
};

const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit
  };
};

module.exports = {
  isValidEmail,
  isValidPhone,
  validatePassword,
  sanitizeString,
  isValidObjectId,
  isValidCountryCode,
  isValidFileExtension,
  validatePagination
};