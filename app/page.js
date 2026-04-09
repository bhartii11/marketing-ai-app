// "use client";
// import { useState } from "react";
// import { Mail, MessageCircle, Megaphone } from "lucide-react"; // Optional: lucide-react for icons

// export default function Home() {
//   const [campaign, setCampaign] = useState("");
//   const [company, setCompany] = useState("");
//   const [description, setDescription] = useState("");
//   const [result, setResult] = useState({ email: "", whatsapp: "", linkedin: "" });
//   const [loading, setLoading] = useState(false);

//   const handleGenerate = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch("/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ company, campaign, description }),
//       });
//       const data = await res.json();
//       setResult(data);
//     } catch (err) {
//       alert("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* 1. BLUE HEADER SECTION */}
//       <div className="bg-[#2563eb] pt-12 pb-32 text-center text-white">
//         <div className="flex items-center justify-center gap-3 mb-2">
//           <Megaphone size={40} className="text-white" />
//           <h1 className="text-4xl font-extrabold tracking-tight">Marketing AI Pro</h1>
//         </div>
//         <p className="text-blue-100 text-lg">Generate multi-channel campaigns in seconds</p>
//       </div>

//       {/* 2. FLOATING INPUT CARD */}
//       <div className="max-w-4xl mx-auto -mt-20 px-4">
//         <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
//           <div className="space-y-5">
//             <div>
//               <label className="block text-sm font-semibold text-gray-500 mb-1">Company Name</label>
//               <input
//                 className="w-full p-3 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="Cloud Certitude"
//                 value={company}
//                 onChange={(e) => setCompany(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-500 mb-1">Campaign Goal</label>
//               <input
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="Looking for a mulesoft developer"
//                 value={campaign}
//                 onChange={(e) => setCampaign(e.target.value)}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-500 mb-1">Product/Service Description</label>
//               <textarea
//                 rows={4}
//                 className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                 placeholder="Describe your goals..."
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//             </div>

//             <button
//               onClick={handleGenerate}
//               disabled={loading}
//               className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg active:transform active:scale-[0.98]"
//             >
//               {loading ? "Generating Strategy..." : "Generate Strategy"}
//             </button>
//           </div>
//         </div>

//         {/* 3. OUTPUT GRID */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-20">
          
//           {/* Email Card */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
//             <div className="bg-[#2563eb] p-4 flex items-center gap-2 text-white font-bold">
//               <Mail size={20} /> Email Campaign
//             </div>
//             <div className="p-5 text-gray-600 text-sm min-h-[150px]">
//               {result.email || "Drafting will appear here..."}
//             </div>
//           </div>

//           {/* WhatsApp Card */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
//             <div className="bg-[#22c55e] p-4 flex items-center gap-2 text-white font-bold">
//               <MessageCircle size={20} /> WhatsApp Blast
//             </div>
//             <div className="p-5 text-gray-600 text-sm min-h-[150px]">
//               {result.whatsapp || "Messages will appear here..."}
//             </div>
//           </div>

//           {/* LinkedIn Card */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
//             <div className="bg-[#0077b5] p-4 flex items-center gap-2 text-white font-bold">
//                Linkedin Post
//             </div>
//             <div className="p-5 text-gray-600 text-sm min-h-[150px]">
//               {result.linkedin || "Posts will appear here..."}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from "react";

export default function Home() {
  const [campaign, setCampaign] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState({
    email: "",
    whatsapp: "",
    linkedin: "",
  });

  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company, campaign, description }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🚀 Marketing AI Tool
      </h1>

      {/* INPUT SECTION */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <input
          className="border p-2 w-full mb-3"
          placeholder="Company Name"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-3"
          placeholder="Campaign"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </div>

      {/* OUTPUT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2 text-blue-600">📧 Email</h3>
          <p className="whitespace-pre-wrap">{result.email}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2 text-green-600">💬 WhatsApp</h3>
          <p className="whitespace-pre-wrap">{result.whatsapp}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2 text-blue-800">💼 LinkedIn</h3>
          <p className="whitespace-pre-wrap">{result.linkedin}</p>
        </div>

      </div>
    </div>
  );
}