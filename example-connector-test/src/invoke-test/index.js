export const handle = async (payload, context, int = {}) => {
  if(payload.ping) {
    return {
      pong: true
    };
  } else {
    return {
      pong: false
    };
  }
};