/**
 * Queues one-off messages in the session so they survive a redirect.
 *
 * Replaces connect-flash, whose code has not changed since 2013 and which
 * calls the deprecated util.isArray on every use. The three call shapes match
 * the original:
 *
 *   req.flash(type, message)  queues a message, returns the queue length
 *   req.flash(type)           returns and clears the messages of that type
 *   req.flash()               returns and clears every type
 */
function flash() {
  return function flashMiddleware(req, res, next) {
    if (typeof req.flash === "function") return next();

    req.flash = function queueOrRead(type, message) {
      if (!req.session) {
        throw new Error("req.flash() requires a session.");
      }

      const messages = (req.session.flash = req.session.flash || {});

      if (type !== undefined && message !== undefined) {
        const queue = (messages[type] = messages[type] || []);

        queue.push(...(Array.isArray(message) ? message : [message]));

        return queue.length;
      }

      if (type !== undefined) {
        const queued = messages[type] || [];

        delete messages[type];

        return queued;
      }

      req.session.flash = {};

      return messages;
    };

    next();
  };
}

module.exports = flash;
