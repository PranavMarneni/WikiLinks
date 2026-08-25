import React, { useState } from "react";
import { MessageSquareText } from "lucide-react";

function formatPhoneInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`;
  return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
}

export default function PhoneNumberModal({ onSubmit, onSkip }) {
  const [value, setValue] = useState("");
  const digits = value.replace(/\D/g, "");
  const isValid = digits.length === 10;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(digits);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquareText className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Get a text reminder</h2>
              <p className="text-sm text-gray-500">
                Drop your number and we'll text you a reminder when the contest kicks off. No spam, just the one heads-up.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={value}
                onChange={(e) => setValue(formatPhoneInput(e.target.value))}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                type="submit"
                disabled={!isValid}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isValid
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Text me a reminder
              </button>
            </form>

            <button
              onClick={onSkip}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
