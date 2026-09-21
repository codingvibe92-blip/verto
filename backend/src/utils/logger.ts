const isProd = process.env.NODE_ENV === 'production';

function log(level: string, msg: string, meta?: unknown): void {
  const parts = [`[${new Date().toISOString()}]`, level.toUpperCase(), msg];
  if (meta !== undefined) {
    parts.push(JSON.stringify(meta));
  }
  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error(parts.join(' '));
  } else if (isProd && level === 'info') {
    // keep prod info quiet
  } else {
    // eslint-disable-next-line no-console
    console.log(parts.join(' '));
  }
}

const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
};

export default logger;