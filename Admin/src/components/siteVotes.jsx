import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function SiteVotesPage() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchVotes = async () => {
    setLoading(true);
    const col = collection(db, "siteVotes");
    const snapshot = await getDocs(col);
    setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setSelected(null);
    setLoading(false);
  };

  useEffect(() => { fetchVotes(); }, []);

  const removeFromVotes = async (id) => {
    await deleteDoc(doc(db, "siteVotes", id));
    if (selected && selected.id === id) setSelected(null);
    fetchVotes();
  };

  return (
    <div className="w-full flex gap-8 bg-gray-900 rounded-xl p-8 shadow-lg min-h-[350px] font-sans">
      <ul className="flex-1 m-0 p-0 list-none">
        {loading ? (
          <li className="flex items-center justify-center h-24">
            <span className="w-7 h-7 border-4 border-gray-800 border-t-blue-400 rounded-full animate-spin inline-block" />
            <span className="ml-4 text-gray-400 text-lg">Loading...</span>
          </li>
        ) : votes.length === 0 ? (
          <li className="text-gray-400 italic text-center py-6">
            No votes yet.
          </li>
        ) : (
          votes.map(item => (
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
                onClick={() => removeFromVotes(item.id)}
                className="
                  ml-5 bg-gray-800 hover:bg-blue-900 text-white px-4 py-1.5 text-base rounded-lg
                  transition-colors border-none
                "
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
              <strong>safe:</strong>{" "}
              <span className="text-gray-400 font-semibold">
                {selected.safe !== undefined ? selected.safe : "N/A"}
              </span>
            </div>
            <div className="mb-2">
              <strong>unsafe:</strong>{" "}
              <span className="text-gray-400 font-semibold">
                {selected.unsafe !== undefined ? selected.unsafe : "N/A"}
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
  );
}