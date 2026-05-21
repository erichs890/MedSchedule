import { describe, it, expect } from "vitest";
import {
  parseDate,
  toISODate,
  addDays,
  formatDate,
  formatDateLong,
  formatTime,
  endTime,
  formatCurrency,
  calcAge,
  getSession,
  isPastSlot,
  isFinal,
  initials,
} from "./format";

describe("datas", () => {
  it("parseDate converte sem deslocamento de fuso", () => {
    const d = parseDate("2026-05-21");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4); // maio
    expect(d.getDate()).toBe(21);
  });

  it("toISODate formata uma Date local", () => {
    expect(toISODate(new Date(2026, 4, 21))).toBe("2026-05-21");
  });

  it("addDays soma e vira o mês corretamente", () => {
    expect(addDays("2026-05-21", 1)).toBe("2026-05-22");
    expect(addDays("2026-05-31", 1)).toBe("2026-06-01");
    expect(addDays("2026-05-01", -1)).toBe("2026-04-30");
  });

  it("formatDate usa o padrão brasileiro", () => {
    expect(formatDate("2026-05-21")).toBe("21/05/2026");
  });

  it("formatDateLong capitaliza o dia da semana", () => {
    // 21/05/2026 é uma quinta-feira
    expect(formatDateLong("2026-05-21")).toMatch(/^Quinta-feira/);
  });
});

describe("horários", () => {
  it("formatTime corta os segundos", () => {
    expect(formatTime("09:30:00")).toBe("09:30");
  });

  it("endTime soma a duração", () => {
    expect(endTime("09:30", 45)).toBe("10:15");
    expect(endTime("09:30:00", 30)).toBe("10:00");
  });

  it("getSession classifica o turno", () => {
    expect(getSession("08:00")).toBe("manha");
    expect(getSession("14:00")).toBe("tarde");
    expect(getSession("18:30")).toBe("noite");
  });

  it("isPastSlot identifica horários passados", () => {
    expect(isPastSlot("2020-01-01", "08:00")).toBe(true);
    expect(isPastSlot("2099-01-01", "08:00")).toBe(false);
  });
});

describe("formatação e utilidades", () => {
  it("formatCurrency formata em reais", () => {
    const v = formatCurrency(1500);
    expect(v).toContain("1.500,00");
    expect(v).toContain("R$");
  });

  it("calcAge calcula a idade", () => {
    // Nascido em 1990: em 2026 ou depois tem ao menos 35 anos.
    expect(calcAge("1990-01-01")).toBeGreaterThanOrEqual(35);
    expect(calcAge(null)).toBeNull();
  });

  it("isFinal reconhece estados finais", () => {
    expect(isFinal("realizado")).toBe(true);
    expect(isFinal("cancelado")).toBe(true);
    expect(isFinal("agendado")).toBe(false);
  });

  it("initials gera as iniciais do nome", () => {
    expect(initials("Mariana Costa")).toBe("MC");
    expect(initials("João Pedro Santos")).toBe("JS");
    expect(initials("Ana")).toBe("AN");
  });
});
