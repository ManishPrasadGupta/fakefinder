import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase-config";
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState([]);
  const [form, setForm] = useState({
    url: "",
    name: "",
    reason: "",
    reportedBy: "",
    safe: 0,
    unsafe: 0,
    blacklistedOn: "",
  });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchBlacklist = async () => {
    setLoading(true);
    const col = collection(db, "blacklistedUrls");
    const snapshot = await getDocs(col);
    setBlacklist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addToBlacklist = async (e) => {
    e.preventDefault();
    if (form.url) {
      await addDoc(collection(db, "blacklistedUrls"), {
        url: form.url,
        name: form.name,
        reason: form.reason,
        "reported by": form.reportedBy,
        safe: Number(form.safe),
        unsafe: Number(form.unsafe),
        "Blacklisted on": form.blacklistedOn
          ? Timestamp.fromDate(new Date(form.blacklistedOn))
          : Timestamp.now(),
      });
      setForm({
        url: "",
        name: "",
        reason: "",
        reportedBy: "",
        safe: 0,
        unsafe: 0,
        blacklistedOn: "",
      });
      fetchBlacklist();
    }
  };

  const removeFromBlacklist = async (id) => {
    await deleteDoc(doc(db, "blacklistedUrls", id));
    if (selected && selected.id === id) setSelected(null);
    fetchBlacklist();
  };


  return (
    <div className="max-w-4xl mx-auto my-8 px-6 py-8 bg-gray-900 text-white rounded-xl shadow-lg">
      <form
        onSubmit={addToBlacklist}
        className="mb-8 flex flex-wrap gap-3 items-center"
      >
        <input
          type="text"
          name="url"
          value={form.url}
          onChange={handleChange}
          placeholder="Add URL to blacklist"
          required
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          type="text"
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Reason"
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          type="text"
          name="reportedBy"
          value={form.reportedBy}
          onChange={handleChange}
          placeholder="Reported By"
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <input
          type="datetime-local"
          name="blacklistedOn"
          value={form.blacklistedOn}
          onChange={handleChange}
          placeholder="Blacklisted On"
          className="flex-none p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 font-semibold px-6 py-2 rounded-lg shadow transition text-white"
        >
          Add
        </button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <span className="w-7 h-7 border-4 border-gray-800 border-t-blue-400 rounded-full animate-spin inline-block" />
          <span className="ml-4 text-gray-400 text-lg">Loading...</span>
        </div>
      ) : (
        <div className="flex gap-8">
          <ul className="flex-1 m-0 p-0 list-none">
            {blacklist.length === 0 ? (
              <li className="text-gray-400 italic text-center py-6">
                No blacklisted URLs.
              </li>
            ) : (
              blacklist.map(item => (
                <li
                  key={item.id}
                  className={`mb-2 rounded-lg transition-colors px-4 py-2 flex items-center cursor-pointer
                    ${selected && selected.id === item.id ? "bg-blue-950 shadow-md" : "hover:bg-gray-800"}
                  `}
                >
                  <span
                    onClick={() => setSelected(item)}
                    className={`
                      ${selected && selected.id === item.id ? "underline" : ""}
                      text-blue-400 font-medium text-base flex-1 break-words
                    `}
                    title={item.url}
                  >
                    {item.url}
                  </span>
                  <button
                    onClick={() => removeFromBlacklist(item.id)}
                    className="ml-5 bg-gray-800 hover:bg-red-700 text-white px-4 py-1.5 text-base rounded-lg transition-colors border-none"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="flex-1 border-l border-gray-700 pl-7 min-h-[200px] flex flex-col justify-center">
            {selected ? (
              <div>
                <h3 className="mb-4 text-blue-400 font-semibold text-lg">
                  Details for <span className="text-white font-medium">{selected.url}</span>
                </h3>
                <div className="mb-2">
                  <strong>Blacklisted on:</strong>{" "}
                  <span className="text-gray-200">
                    {selected["Blacklisted on"]
                      ? selected["Blacklisted on"].toDate
                        ? selected["Blacklisted on"].toDate().toLocaleString()
                        : selected["Blacklisted on"]
                      : "N/A"}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>name:</strong> <span className="text-gray-200">{selected.name || ""}</span>
                </div>
                <div className="mb-2">
                  <strong>reason:</strong> <span className="text-gray-200">{selected.reason || ""}</span>
                </div>
                <div className="mb-2">
                  <strong>reported by:</strong> <span className="text-gray-200">{selected["reported by"] || selected.reportedBy || ""}</span>
                </div>
                <div className="mb-2">
                  <strong>safe:</strong>{" "}
                  <span className={
                    selected.safe === 1
                      ? "text-green-400 font-semibold"
                      : selected.safe === 0
                      ? "text-gray-400"
                      : "text-red-400 font-semibold"
                  }>
                    {selected.safe !== undefined
                      ? selected.safe
                      : "N/A"}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>unsafe:</strong>{" "}
                  <span className={
                    selected.unsafe === 1
                      ? "text-red-400 font-semibold"
                      : selected.unsafe === 0
                      ? "text-gray-400"
                      : "text-green-400 font-semibold"
                  }>
                    {selected.unsafe !== undefined
                      ? selected.unsafe
                      : "N/A"}
                  </span>
                </div>
                <div className="mb-2">
                  <strong>url:</strong> <span className="text-blue-300">{selected.url}</span>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <em>Select a URL to see details</em>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}