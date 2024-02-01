export const handle = async (payload, context, int = {}) => {
  console.log(JSON.stringify(payload, undefined, 2));
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