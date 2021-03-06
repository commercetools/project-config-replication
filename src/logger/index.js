import winston from 'winston';

export default ({ level, isDisabled }) => {
  const transports = [];
  const exceptionHandlers = [];
  let logger;

  if (isDisabled) {
    logger = winston.createLogger();
    console.log('\u001b[32minfo\u001b[39m: [logger] is disabled by configuration');
  } else {
    transports.push(new winston.transports.Console({
      level,
      json: false,
      timestamp: true,
      colorize: true,
    }));

    exceptionHandlers.push(new winston.transports.Console({
      level,
      json: false,
      timestamp: true,
      colorize: true,
      silent: false,
      prettyPrint: true,
    }));

    logger = winston.createLogger({
      format: winston.format.simple(),
      transports,
      exceptionHandlers,
      exitOnError: false,
    });
  }

  return logger;
};
