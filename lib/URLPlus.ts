export default class URLPlus extends URL {
  getHashParam(key: string) {
    const params = new URLSearchParams(this.hash.slice(1));
    return params.get(key);
  }
  setHashParam(key: string, value?: string) {
    const params = new URLSearchParams(this.hash.slice(1));
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    this.hash = params.toString();
  }
  getSearchParam(key: string) {
    const params = new URLSearchParams(this.search);
    return params.get(key);
  }
  setSearchParam(key: string, value?: string) {
    const params = new URLSearchParams(this.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    this.search = params.toString();
  }
}
