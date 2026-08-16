export type ToastType = 'success' | 'error';

export interface ToastData {
  id: number;
  text: string;
  type: ToastType;
}

type Listener = (toast: ToastData | null) => void;

let listener: Listener | null = null;
let nextId = 0;

export function setToastListener(next: Listener | null) {
  listener = next;
}

export function showToast(text: string, type: ToastType = 'success') {
  listener?.({ id: ++nextId, text, type });
}
