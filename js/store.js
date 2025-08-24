const KEY = 'wl.currentConfig.v1';
const storage = localStorage; // ← 이미 결정한 대로 영구 저장
const DEFAULT = { breatheSec:120, holdSec:60, decreaseSec:10, rounds:6, updatedAt:null };

export function load(){
  try { return { ...DEFAULT, ...JSON.parse(storage.getItem(KEY)||'{}') }; }
  catch { return DEFAULT; }
}
export function save(cfg){
  const data = { ...cfg, updatedAt: new Date().toISOString() };
  storage.setItem(KEY, JSON.stringify(data));
  return data;
}
