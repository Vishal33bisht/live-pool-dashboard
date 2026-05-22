const formatMeta = (meta = {}) => {
    if (meta instanceof Error) {
        return {
            name: meta.name,
            message: meta.message,
            stack: meta.stack,
        };
    }

    return Object.fromEntries(
        Object.entries(meta).map(([key, value]) => [
            key,
            value instanceof Error
                ? {
                    name: value.name,
                    message: value.message,
                    stack: value.stack,
                }
                : value,
        ])
    );
};

const write = (level, message, meta) => {
    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        ...(meta ? { meta: formatMeta(meta) } : {}),
    };

    const output = JSON.stringify(payload);
    if (level === "error") {
        process.stderr.write(`${output}\n`);
        return;
    }

    process.stdout.write(`${output}\n`);
};

const logger = {
    info: (message, meta) => write("info", message, meta),
    warn: (message, meta) => write("warn", message, meta),
    error: (message, meta) => write("error", message, meta),
};

export default logger;
