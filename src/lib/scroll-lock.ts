// Trava o scroll do body de forma segura quando há camadas sobrepostas
// (modal aberto sobre o painel de detalhe, por exemplo).
let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = "";
}
