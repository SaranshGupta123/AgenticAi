export const saveLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("LS save error:", key, e);
  }
};

export const loadLS = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("LS load error:", key, e);
    return fallback;
  }
};
