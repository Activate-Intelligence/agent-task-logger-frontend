import baseConverter from 'open-next/converters/aws-apigw-v2.js'

const DEFAULT_STAGE_PREFIX = '/$default'

const normalizePath = (rawPath) => {
  if (!rawPath || typeof rawPath !== 'string') {
    return '/'
  }

  let path = rawPath

  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  if (path === DEFAULT_STAGE_PREFIX) {
    return '/'
  }

  if (path.startsWith(`${DEFAULT_STAGE_PREFIX}/`)) {
    path = path.slice(DEFAULT_STAGE_PREFIX.length)
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
  }

  if (path === '/index' || path === '/index.html') {
    return '/'
  }

  // Collapse duplicate slashes that can appear after rewrites
  path = path.replace(/\/+/g, '/').trim()

  if (path === '') {
    return '/'
  }

  return path
}

const normalizeEvent = (event) => {
  if (!event || typeof event !== 'object') {
    return event
  }

  const normalizedPath = normalizePath(event.rawPath ?? event.requestContext?.http?.path)

  return {
    ...event,
    rawPath: normalizedPath,
    requestContext: {
      ...event.requestContext,
      http: {
        ...event.requestContext?.http,
        path: normalizedPath,
      },
    },
  }
}

export default {
  name: 'aws-apigw-v2-normalized',
  async convertFrom(event) {
    const normalizedEvent = normalizeEvent(event)
    return baseConverter.convertFrom(normalizedEvent)
  },
  async convertTo(result, originalRequest) {
    return baseConverter.convertTo(result, originalRequest)
  },
}
