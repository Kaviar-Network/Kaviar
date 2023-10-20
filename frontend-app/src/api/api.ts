export async function callAPI({
  url,
  method,
  body,
  headers,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}) {
  console.log("[callAPI] url = ", url);
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  });

  console.log("[callAPI] response: ", response);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(`HTTP error! status: ${data.message}`);
  }

  const data = await response.json();

  console.log("[callAPI] data: ", data);
  return data;
}

export async function deposit(hashCommitment: string, networkTo: string) {
  console.log("calling deposit(hash, networkTo) = ", hashCommitment, networkTo);
  return callAPI({
    url: `http://localhost:3001/deposit/${hashCommitment}/${networkTo}`,
    method: "GET",
  });
}

export async function leafIndex(networkTo: string) {
  console.log("calling leafIndex(hash, networkTo)");
  return callAPI({
    url: `http://localhost:3001/leafindex/${networkTo}`,
    method: "GET",
  });
}

export async function withdraw(leafIndex: Number, networkTo: string) {
  console.log("calling withdraw(leafIndex, networkTo)");
  return callAPI({
    url: `http://localhost:3001/leafindex/${networkTo}`,
    method: "GET",
  });
}
