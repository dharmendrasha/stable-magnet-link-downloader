import WebTorrent from "webtorrent";

const tor = new WebTorrent();

export const torClient = () => {
  const nTor = tor;
  return nTor;
};
