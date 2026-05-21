import { describe, it, expect } from "vitest";
import {
  nextStatus,
  STATUS_FLOW,
  FINAL_STATUSES,
  TIME_SLOTS,
} from "./constants";

describe("fluxo de status", () => {
  it("avança na ordem correta", () => {
    expect(nextStatus("agendado")).toBe("confirmado");
    expect(nextStatus("confirmado")).toBe("aguardando");
    expect(nextStatus("aguardando")).toBe("em_atendimento");
    expect(nextStatus("em_atendimento")).toBe("realizado");
  });

  it("não avança a partir de estados finais", () => {
    expect(nextStatus("realizado")).toBeNull();
    expect(nextStatus("cancelado")).toBeNull();
  });

  it("o fluxo tem 5 etapas e 2 estados finais", () => {
    expect(STATUS_FLOW).toHaveLength(5);
    expect(FINAL_STATUSES).toEqual(["realizado", "cancelado"]);
  });
});

describe("horários da clínica", () => {
  it("gera slots de 30 min das 07:00 às 18:30", () => {
    expect(TIME_SLOTS[0]).toBe("07:00");
    expect(TIME_SLOTS[TIME_SLOTS.length - 1]).toBe("18:30");
    expect(TIME_SLOTS).toHaveLength(24);
  });

  it("não tem horários duplicados", () => {
    expect(new Set(TIME_SLOTS).size).toBe(TIME_SLOTS.length);
  });
});
