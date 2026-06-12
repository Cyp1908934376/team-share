/**
 * Validation rules
 */
export const ValidationRules = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  password: {
    minLength: 6,
    maxLength: 100,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  resourceName: {
    minLength: 1,
    maxLength: 200,
  },
  slug: {
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },
} as const

/**
 * Validation messages
 */
export const ValidationMessages = {
  required: '此字段为必填项',
  minLength: (min: number) => `最少需要 ${min} 个字符`,
  maxLength: (max: number) => `最多允许 ${max} 个字符`,
  invalidEmail: '请输入有效的邮箱地址',
  invalidUsername: '用户名只能包含字母、数字、下划线和连字符',
  invalidSlug: 'Slug 只能包含小写字母、数字和连字符',
  invalidUrl: '请输入有效的 URL',
  invalidJson: '请输入有效的 JSON 格式',
  passwordMismatch: '两次输入的密码不一致',
} as const

/**
 * Validate username
 */
export function validateUsername(username: string): string | null {
  if (!username) return ValidationMessages.required
  if (username.length < ValidationRules.username.minLength) {
    return ValidationMessages.minLength(ValidationRules.username.minLength)
  }
  if (username.length > ValidationRules.username.maxLength) {
    return ValidationMessages.maxLength(ValidationRules.username.maxLength)
  }
  if (!ValidationRules.username.pattern.test(username)) {
    return ValidationMessages.invalidUsername
  }
  return null
}

/**
 * Validate email
 */
export function validateEmail(email: string): string | null {
  if (!email) return ValidationMessages.required
  if (!ValidationRules.email.pattern.test(email)) {
    return ValidationMessages.invalidEmail
  }
  return null
}

/**
 * Validate password
 */
export function validatePassword(password: string): string | null {
  if (!password) return ValidationMessages.required
  if (password.length < ValidationRules.password.minLength) {
    return ValidationMessages.minLength(ValidationRules.password.minLength)
  }
  if (password.length > ValidationRules.password.maxLength) {
    return ValidationMessages.maxLength(ValidationRules.password.maxLength)
  }
  return null
}

/**
 * Validate JSON string
 */
export function validateJson(json: string): string | null {
  try {
    JSON.parse(json)
    return null
  } catch {
    return ValidationMessages.invalidJson
  }
}
