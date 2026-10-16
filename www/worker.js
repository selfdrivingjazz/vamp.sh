export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(`https://vamp.sh${url.pathname}${url.search}`, 301);
  },
};
