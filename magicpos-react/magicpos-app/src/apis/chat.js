import api from "./axios";

export async function fetchMacros() {
  const { data } = await api.get("/chat/macros");
  return data; // [{ no, text_message }]
}

export async function createMacro(text_message) {
  const { data } = await api.post("/chat/macros", { text_message });
  return data; // { no, text_message }
}

export async function deleteMacro(no) {
  await api.delete(`/chat/macros/${no}`);
}