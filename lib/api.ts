export async function getParticipants() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Participants`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Gagal ambil peserta");
  return res.json();
}

export async function checkInByQr(qrCode: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/checkin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ qrCode }),
  });

  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (res.status === 409) {
    throw new Error("ALREADY_CHECKED_IN");
  }

  if (!res.ok) {
    throw new Error("SERVER_ERROR");
  }

  return res.json();
}

export async function addParticipant(
  name: string,
  email?: string
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/Participants`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Gagal menambahkan peserta");
  }

  return res.json();
}
