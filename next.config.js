module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["tracktask.eu.org", "avatars.githubusercontent.com", "u.cubeupload.com", "i.bb.co", "api.wasteof.money"],
  },
  async redirects() {
    return [
      process.env.MAINTENANCE_MODE === "true"
        ? { source: "/((?!maintenance)(?!_next)(?!static).*)", destination: "/maintenance", permanent: false }
        : null,
    ].filter(Boolean);
  },
};
