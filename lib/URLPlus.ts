export default class URLPlus extends URL {
  getHashParam(key: string) {
    const params = new URLSearchParams(this.hash.slice(1));
    return params.get(key);
  }
  setHashParam(key: string, value: string) {
    const params = new URLSearchParams(this.hash.slice(1));
    params.set(key, value);
    this.hash = params.toString();
  }
  getSearchParam(key: string) {
    const params = new URLSearchParams(this.search);
    return params.get(key);
  }
  setSearchParam(key: string, value: string) {
    const params = new URLSearchParams(this.search);
    params.set(key, value);
    this.search = params.toString();
  }
}
