import React from "react";

export default function ThreeDSButton({ onResult }) {
  const API_BASE = "http://localhost:3001";
  const token = localStorage.getItem("authToken");

  const handle3DS = async () => {
    try {
      const res = await fetch(`${API_BASE}/iam/verification/3ds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      onResult(`3DS Result: ${JSON.stringify(data)}`);
    } catch (err) {
      onResult("Error in 3DS");
      console.error(err);
    }
  };

  return (
    <button
      onClick={handle3DS}
      className="w-64 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
    >
      3DS
    </button>
  );
}
