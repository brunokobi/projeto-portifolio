import { useState } from "react";

const ObjectDetection = () => {
  const [image, setImage] = useState<File | null>(null);
  const [result, setResult] = useState<object[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const API_URL = "https://api-inference.huggingface.co/models/facebook/detr-resnet-50";
  const API_TOKEN = import.meta.env.VITE_HUGGING_FACE_API_KEY; // Substitua pelo seu token

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleDetectObjects = async () => {
    if (!image) return;
    setLoading(true);
    setStatus("Processando...");

    const formData = new FormData();
    formData.append("image", image);

    try {
      let response;
      while (true) {
        const fetchRes = await fetch(API_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${API_TOKEN}` },
          body: formData,
        });
        const json = await fetchRes.json();
        response = { data: json };

        if (json.error && json.error.includes("currently loading")) {
          setStatus(`Modelo carregando, aguardando ${json.estimated_time} segundos...`);
          await new Promise((resolve) => setTimeout(resolve, json.estimated_time * 1000));
        } else {
          break;
        }
      }

      setResult(response.data);
      setStatus("Detecção concluída!");
    } catch (error) {
      console.error("Erro ao detectar objetos:", error);
      setStatus("Erro ao processar imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button
        onClick={handleDetectObjects}
        className="bg-blue-500 text-white px-4 py-2 mt-2"
        disabled={loading}
      >
        {loading ? "Processando..." : "Detectar Objetos"}
      </button>

      {status && <p className="mt-2 text-gray-700">{status}</p>}

      {result && (
        <pre className="bg-gray-200 p-2 mt-4 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ObjectDetection;
